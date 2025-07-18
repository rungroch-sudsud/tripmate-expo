export interface ApiResponse {
  data: {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl?: string;
  }[];
}

export interface ServicesResponse {
  data: {
    id: string;
    title: string;
  }[];
}


export interface Category {
  id: string;
  title: string;
  iconImageUrl?: string;
  activeIconImageUrl?: string;
}


export interface Interest{
  id:string;
  title:string
}


export interface TravelStylesComponentProps {
  // Core props
  categories: Category[];
  selectedItems: string[];
  onToggleSelection: (id: string) => void;
  loading: boolean;
  styles: any;
  
  // Optional props for different screens
  error?: string | null;
  clearError?: () => void;
  isEditMode?: boolean;
  
  // Customization props
  title?: string;
  subtitle?: string;
  selectedColor?: string;
  unselectedColor?: string;
  iconSize?: { width: number; height: number };
}


export interface TravelInterestComponentProps {
  // Core props
  categories: Category[];
  selectedItems: string[];
  onToggleSelection: (id: string) => void;
  loading: boolean;
  styles: any;
  selection?:string,
  // Optional props for different screens
  error?: string | null;
  clearError?: () => void;
  isEditMode?: boolean;
  
  // Customization props
  title?: string;
  subtitle?: string;
  selectedColor?: string;
  unselectedColor?: string;
  // Removed iconSize since we're not using icons anymore
}
