import React, { useEffect, useState } from "react";
import { Text, View, FlatList, Button, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import { loadTasks, saveTasks } from "../../Utils/TaskStorage";
import { Task } from "../../Types/Task";

export default function Index() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const loadedTasks = await loadTasks();
            setTasks(loadedTasks);
        };
        fetchTasks();
    }, []);

    const addTask = async () => {
        const newTask: Task = {
            id: Date.now(),
            title: `Task ${tasks.length + 1}`,
            description: `Description of ${tasks.length + 1}`,
            status: false,
            createdAt: new Date().toISOString(),
            completedAt: '',
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
        Toast.show({ type: "success", text1: "Task added!", text2: newTask.title });
    };

    const markTaskAsCompleted = async (taskId: number) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, status: true, completedAt: new Date().toString()} : task
        );
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
        Toast.show({ type: "success", text1: "Task completed!" });
    };

    const pendingTasks = tasks.filter((task) => task.status === false);

    const renderTask = ({ item }: { item: Task }) => (
        <View style={styles.task}>
            <TouchableOpacity onPress={() => {}}>
                <Link href={`/Tasks/${item.id}`}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                </Link>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.completeButton}
                onPress={() => markTaskAsCompleted(item.id)}
            >
                <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pending Tasks</Text>
            <FlatList
                data={pendingTasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTask}
                ListEmptyComponent={<Text style={styles.emptyText}>No pending tasks 🎉</Text>}
                contentContainerStyle={pendingTasks.length === 0 ? styles.emptyContainer : undefined}
            />
            <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                <Text style={styles.addTaskButtonText}>+ Add Task</Text>
            </TouchableOpacity>
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
        borderColor: "#007BFF",
    },
    taskTitle: {
        fontSize: 18,
        color: "#333",
        fontWeight: "600",
    },
    completeButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    completeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    addTaskButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    addTaskButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
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
});
