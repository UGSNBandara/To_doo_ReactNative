import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { Task } from "../../Types/Task";
import { loadTasks } from "../../Utils/TaskStorage";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

const Profile = () => {
    const [editable, setEditable] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        role: "",
        profilePicture: "", // Add profile picture to profileData
    });

    // Load profile data from AsyncStorage
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const savedProfile = await AsyncStorage.getItem("profile");
                if (savedProfile) {
                    setProfileData(JSON.parse(savedProfile));
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
            }
        };
        loadProfile();
    }, []);

    // Save profile data to AsyncStorage
    const saveProfile = async () => {
        try {
            await AsyncStorage.setItem("profile", JSON.stringify(profileData));
            setEditable(false);
        } catch (error) {
            console.error("Failed to save profile data:", error);
        }
    };

    const handleChange = (field: string, value: string) => {
        setProfileData({ ...profileData, [field]: value });
    };

    const fetchTasks = async () => {
        try {
            const loadedTasks = await loadTasks();
            setTasks(loadedTasks || []); // Ensure tasks is an array
        } catch (error) {
            console.error("Failed to load tasks:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    // Select an image using the image picker
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0].uri;
                setProfileData((prev) => ({ ...prev, profilePicture: selectedImage }));

                // Save updated profile to AsyncStorage
                await AsyncStorage.setItem("profile", JSON.stringify({ ...profileData, profilePicture: selectedImage }));
                Toast.show({ type: "success", text1: "Profile picture successfully uploaded!" });
            } else {
                Toast.show({ type: "error", text1: "Image not found!" });
            }
        } catch (error) {
            console.error("Failed to pick an image:", error);
            Toast.show({ type: "error", text1: "Failed to pick image:!" });
        }
    };



    const today = new Date().toISOString().split("T")[0];

    const todayTask = tasks.filter((task: Task) => task.createdAt.split("T")[0] === today);
    const pendingTasks = tasks.filter((task: Task) => !task.status);
    const completedTasks = tasks.filter((task: Task) => task.status);
    const todayCompletedTasks = todayTask.filter((task: Task) => task.status);

    return (
        <View style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={{
                            uri: profileData.profilePicture || "https://via.placeholder.com/150", // Fallback placeholder
                        }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
                <View style={styles.detailsContainer}>
                    {editable ? (
                        <>
                            <TextInput
                                style={styles.input}
                                value={profileData.name}
                                onChangeText={(text) => handleChange("name", text)}
                                placeholder="Name"
                            />
                            <TextInput
                                style={styles.input}
                                value={profileData.email}
                                onChangeText={(text) => handleChange("email", text)}
                                placeholder="Email"
                            />
                            <TextInput
                                style={styles.input}
                                value={profileData.role}
                                onChangeText={(text) => handleChange("role", text)}
                                placeholder="Role"
                            />
                            <Button title="Save" onPress={saveProfile} />
                        </>
                    ) : (
                        <>
                            <Text style={styles.name}>{profileData.name}</Text>
                            <Text style={styles.email}>{profileData.email}</Text>
                            <Text style={styles.detail}>Role: {profileData.role}</Text>
                            <Button title="Edit" onPress={() => setEditable(true)} />
                        </>
                    )}
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{todayTask.length}</Text>
                    <Text style={styles.statLabel}>Today's Tasks</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{todayCompletedTasks.length}</Text>
                    <Text style={styles.statLabel}>Today Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{pendingTasks.length}</Text>
                    <Text style={styles.statLabel}>Pending Tasks</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{completedTasks.length}</Text>
                    <Text style={styles.statLabel}>All Completed</Text>
                </View>
            </View>
            <Toast/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    topSection: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 20,
        alignItems: "center",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#007BFF",
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 20,
        justifyContent: "center",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        fontSize: 16,
        color: "#666",
        marginBottom: 5,
    },
    detail: {
        fontSize: 14,
        color: "#777",
    },
    input: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginBottom: 10,
        color: "#333",
        paddingVertical: 5,
    },
    bottomSection: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007BFF",
    },
    statLabel: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
});

export default Profile;
