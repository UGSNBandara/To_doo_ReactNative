import React, { useEffect, useState, useCallback } from "react";
import { Text, View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native"; // For focus listener
import { loadTasks } from "../../Utils/TaskStorage";
import { Task } from "../../Types/Task";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Completed() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks);
    };



    // Fetch tasks when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const completedTasks = tasks
        .filter((task) => task.status === true)
        .sort((a, b) => {
            const dateA = new Date(a.completedAt || 0).getTime();
            const dateB = new Date(b.completedAt || 0).getTime();
            return dateB - dateA; // Descending order
        })
        .slice(0, 20);


    const renderTask = ({ item }: { item: Task }) => (
        <View style={styles.task}>
            <TouchableOpacity>
                <Link href={`/Tasks/${item.id}`}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                </Link>
            </TouchableOpacity>
            <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Latest Completed Tasks</Text>
            <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTask}
                ListEmptyComponent={<Text style={styles.emptyText}>No completed tasks yet 🎉</Text>}
                contentContainerStyle={completedTasks.length === 0 ? styles.emptyContainer : undefined}
            />
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    task: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    taskTitle: {
        fontSize: 18,
        color: "#333",
        fontWeight: "600",
    },
    emptyText: {
        fontSize: 16,
        color: "#777",
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    completedBadge: {
        backgroundColor: "#4CAF50", // Green background
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    completedBadgeText: {
        color: "#fff", // White text
        fontSize: 14,
        fontWeight: "bold",
    },
});
