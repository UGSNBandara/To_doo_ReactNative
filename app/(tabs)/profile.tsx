import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, Alert, ScrollView, Animated, Easing } from "react-native";
import { Task } from "../../Types/Task";
import { loadTasks } from "../../Utils/TaskStorage";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { theme } from "../../Utils/theme";
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
    const [editable, setEditable] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        role: "",
        profilePicture: "",
    });
    const [completionRate, setCompletionRate] = useState(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

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
            Toast.show({
                type: 'success',
                text1: 'Profile updated successfully!'
            });
        } catch (error) {
            console.error("Failed to save profile data:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to save profile data'
            });
        }
    };

    const handleChange = (field: string, value: string) => {
        setProfileData({ ...profileData, [field]: value });
    };

    const fetchTasks = async () => {
        try {
            const loadedTasks = await loadTasks();
            setTasks(loadedTasks || []);
            
            // Calculate completion rate
            const total = loadedTasks.length;
            const completed = loadedTasks.filter(task => task.status).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            setCompletionRate(rate);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
            
            // Start animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        }, [])
    );

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0].uri;
                setProfileData(prev => ({ ...prev, profilePicture: selectedImage }));
                await AsyncStorage.setItem("profile", JSON.stringify({ ...profileData, profilePicture: selectedImage }));
                Toast.show({
                    type: 'success',
                    text1: 'Profile picture updated successfully!'
                });
            }
        } catch (error) {
            console.error("Failed to pick image:", error);
            Toast.show({
                type: 'error',
                text1: 'Failed to pick image'
            });
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const todayTask = tasks.filter((task: Task) => task.createdAt.split("T")[0] === today);
    const pendingTasks = tasks.filter((task: Task) => !task.status);
    const completedTasks = tasks.filter((task: Task) => task.status);
    const todayCompletedTasks = todayTask.filter((task: Task) => task.status);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{
                                uri: profileData.profilePicture || "https://via.placeholder.com/150",
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
                                <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.name}>{profileData.name || "Your Name"}</Text>
                                <Text style={styles.email}>{profileData.email || "your.email@example.com"}</Text>
                                <Text style={styles.role}>{profileData.role || "Your Role"}</Text>
                                <TouchableOpacity style={styles.editButton} onPress={() => setEditable(true)}>
                                    <Text style={styles.buttonText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Original Task Statistics */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Task Statistics</Text>
                    <View style={styles.statsGrid}>
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
                </View>

                {/* New Progress Section */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Task Completion Progress</Text>
                        <Text style={styles.progressValue}>{completionRate}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${completionRate}%`,
                                    backgroundColor: theme.colors.primary,
                                }
                            ]}
                        />
                    </View>
                </View>
            </Animated.View>
            <Toast />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    profileSection: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: theme.spacing.lg,
    },
    name: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: '700' as const,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    email: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    role: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.md,
    },
    input: {
        fontSize: theme.typography.body.fontSize,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: theme.spacing.md,
        color: theme.colors.text.primary,
        paddingVertical: theme.spacing.xs,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: theme.colors.status.success,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.surface,
        fontSize: theme.typography.body.fontSize,
        fontWeight: '600' as const,
    },
    statsSection: {
        marginTop: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: '700' as const,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    statValue: {
        fontSize: theme.typography.h2.fontSize,
        fontWeight: '700' as const,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
    },
    progressContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    progressTitle: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.primary,
        fontWeight: '600' as const,
    },
    progressValue: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.primary,
        fontWeight: '600' as const,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default Profile;
