import { axiosInstance } from '../../../lib/axios'; // Adjust import path

// Types for better type safety
interface Review {
  comment: string;
  rating: number;
  tripId: string;
  userId: string;
}

interface UserProfile {
  profileImageUrl: string;
  fullname: string;
  userId: string;
}

interface ReviewerProfile {
  profileImageUrl: string;
  fullname: string;
  userId: string;
  rating: number;
  comment: string;
  tripId: string;
}

interface RatingStats {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  totalReviews: number;
  averageRating: number;
}

interface ReviewersData {
  reviewers: ReviewerProfile[];
  ratingStats: RatingStats;
}

// Memory-optimized cache with TTL (Time To Live)
class ProfileCache {
  private cache = new Map<string, { data: UserProfile; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache

  get(userId: string): UserProfile | null {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(userId); // Remove expired cache
    }
    return null;
  }

  set(userId: string, data: UserProfile): void {
    // Limit cache size to prevent memory bloat
    if (this.cache.size >= 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(userId, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
const profileCache = new ProfileCache();

// Optimized getUserProfile with caching
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached) {
      return cached;
    }

    const response = await axiosInstance.get(`/users/profile/${userId}`);
    
    if (response.status === 200) {
      const fullData = response.data.data;
      
      // Extract only needed fields to reduce memory usage
      const profileData: UserProfile = {
        profileImageUrl: fullData.profileImageUrl,
        fullname: fullData.fullname,
        userId: fullData.userId
      };
      
      // Cache the result
      profileCache.set(userId, profileData);
      return profileData;
    }
    
    return null;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 404) {
        console.log(`User profile not found for userId: ${userId}`);
        return null;
      } else if (status === 500) {
        console.error('Internal server error while fetching user profile:', error.response.data);
        return null;
      } else {
        console.error(`HTTP error ${status} while fetching user profile:`, error.response.data);
        return null;
      }
    } else if (error.request) {
      console.error('Network error while fetching user profile:', error.message);
      return null;
    } else {
      console.error('Error fetching user profile:', error.message);
      return null;
    }
  }
};

// Main function to fetch reviewers with optimization
export const fetchReviewers = async (userId: string): Promise<ReviewersData | null> => {
  try {
    // Get user profile data
    const response = await axiosInstance.get(`/users/profile/${userId}`);
    
    if (response.status !== 200 || !response.data.data) {
      return null;
    }

    const userData = response.data.data;
    const reviews: Review[] = userData.reviews || [];

    if (reviews.length === 0) {
      return {
        reviewers: [],
        ratingStats: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
          totalReviews: 0,
          averageRating: 0
        }
      };
    }

    // Initialize rating statistics
    const ratingStats: RatingStats = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
      totalReviews: reviews.length,
      averageRating: 0
    };

    // Calculate rating statistics
    let totalRating = 0;
    reviews.forEach(review => {
      const rating = Math.max(1, Math.min(5, review.rating)); // Ensure rating is between 1-5
      ratingStats[rating as keyof Omit<RatingStats, 'totalReviews' | 'averageRating'>]++;
      totalRating += rating;
    });

    ratingStats.averageRating = Math.round((totalRating / reviews.length) * 100) / 100; // Round to 2 decimal places

    // Get unique reviewer user IDs to avoid duplicate API calls
    const uniqueReviewerIds = [...new Set(reviews.map(review => review.userId))];

    // Batch fetch reviewer profiles with concurrency limit
    const BATCH_SIZE = 5; // Limit concurrent requests to prevent overwhelming the server
    const reviewerProfiles = new Map<string, UserProfile>();

    for (let i = 0; i < uniqueReviewerIds.length; i += BATCH_SIZE) {
      const batch = uniqueReviewerIds.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (reviewerId) => {
        const profile = await getUserProfile(reviewerId);
        if (profile) {
          reviewerProfiles.set(reviewerId, profile);
        }
        return profile;
      });

      // Wait for current batch to complete before processing next batch
      await Promise.all(batchPromises);
    }

    // Combine review data with profile data
    const reviewers: ReviewerProfile[] = reviews
      .map(review => {
        const profile = reviewerProfiles.get(review.userId);
        if (!profile) {
          return null; // Skip if profile couldn't be fetched
        }

        return {
          profileImageUrl: profile.profileImageUrl,
          fullname: profile.fullname,
          userId: profile.userId,
          rating: review.rating,
          comment: review.comment,
          tripId: review.tripId
        };
      })
      .filter((reviewer): reviewer is ReviewerProfile => reviewer !== null); // Remove null entries

    return {
      reviewers,
      ratingStats
    };

  } catch (error: any) {
    console.error('Error fetching reviewers:', error.message);
    return null;
  }
};

// Utility function to clear cache when needed (e.g., on app backgrounding)
export const clearProfileCache = (): void => {
  profileCache.clear();
};

// Example usage:
/*
const handleFetchReviewers = async () => {
  const reviewersData = await fetchReviewers("nhPcC6DhxGRmZdgGEOlZvNTU0e72");
  
  if (reviewersData) {
    console.log("Reviewers:", reviewersData.reviewers);
    console.log("Rating Stats:", reviewersData.ratingStats);
    
    // Access individual rating counts
    console.log("5 star reviews:", reviewersData.ratingStats[5]);
    console.log("1 star reviews:", reviewersData.ratingStats[1]);
    console.log("Average rating:", reviewersData.ratingStats.averageRating);
  }
};
*/