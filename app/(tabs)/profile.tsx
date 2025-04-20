import React from "react";
import {useEffect, useState, useCallback} from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {Task} from "../../Types/Task";
import {loadTasks } from "../../Utils/TaskStorage";
import {useFocusEffect} from "@react-navigation/native";


const Profile = () => {

    const [task, setTask] = useState<Task[]>([]);

    const fetchtask = async () => {
        const LoadedTasks = await loadTasks();
        setTask(LoadedTasks);
    }


    useFocusEffect(
        useCallback(() =>{
            fetchtask();
            }, [])
    );

    const today = new Date().toISOString().split("T")[0];

    const today_task = task.filter((task: Task) => task.createdAt.split("T")[0] === today);

    const pending_task = task.filter((task: Task) => !task.status);

    const complete_task = task.filter((task: Task) => task.status);

    const today_completed_task = today_task.filter((task: Task) => !task.status);


    return (
        <View style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                {/* Left: Profile Picture */}
                <Image
                    source={{ uri: "https://via.placeholder.com/150" }} // Replace with profile picture URL
                    style={styles.profileImage}
                />
                {/* Right: User Details */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.name}>John Doe</Text>
                    <Text style={styles.email}>johndoe@example.com</Text>
                    <Text style={styles.detail}>Role: Developer</Text>
                    <Text style={styles.detail}>Location: New York, USA</Text>
                    <Text style={styles.detail}>Member since: Jan 2020</Text>
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}> {today_task.length} </Text>
                    <Text style={styles.statLabel}>Today's Tasks</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}> {today_completed_task.length} </Text>
                    <Text style={styles.statLabel}>Today Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}> {pending_task.length} </Text>
                    <Text style={styles.statLabel}>Pending Tasks</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}> {complete_task.length} </Text>
                    <Text style={styles.statLabel}>All Completed</Text>
                </View>
            </View>
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
