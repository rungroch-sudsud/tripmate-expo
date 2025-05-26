import React, { useState } from "react";
import { View, Button, TextInput, Alert, StyleSheet, SafeAreaView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Login Successful!");
      navigation.navigate("Home"); // Now works directly
    } catch (error: any) {
      console.log("Login error:", error.code, error.message);
      switch (error.code) {
        case "auth/invalid-email":
          Alert.alert("Invalid Email", "Please enter a valid email address.");
          break;
        case "auth/user-not-found":
          Alert.alert("User Not Found", "No account found with this email.");
          break;
        case "auth/wrong-password":
          Alert.alert("Wrong Password", "The password is incorrect.");
          break;
        default:
          Alert.alert("Login Failed", error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
});
