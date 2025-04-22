import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Button,
    TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Task } from "../../Types/Task";
import { getTaskById, saveTasks, loadTasks } from "../../Utils/TaskStorage";
import Toast from "react-native-toast-message";

export default function TaskDetail() {
    const {id} = useLocalSearchParams();
    const [task, setTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchTask = async () => {
            if (!id) return; // Ensure id exists
            const numericId = Number(id); // Convert to number
            if (isNaN(numericId)) {
                console.error("Invalid task ID");
                return;
            }
            const taskData = await getTaskById(numericId); // Pass numeric ID
            setTask(taskData);
        };
        fetchTask();

    }, [id]);

    useEffect(() => {
        if(task) {
            setEditTitle(task?.title);
            setEditDescription(task?.description)
        }
    }, [task]);


    const updateTaskDetails = async () => {
        if (!task) return;

        if (editTitle.length > 25){
            Toast.show({type: "error", text1: "Title's can have only maximum 25 characters"});
            return;
        }

        if (!editTitle.trim() || !editDescription.trim()){
            Toast.show({type: "error", text1: "Both field must be filled"});
            return;
        }

        const updatedTask = {
            ...task,
            title: editTitle,
            description: editDescription,
        };

        const tasksList = await loadTasks(); // Load the full list of tasks
        const updatedTasksList = tasksList.map((t) =>
            t.id === task.id ? updatedTask : t
        );

        await saveTasks(updatedTasksList);
        setTask(updatedTask);
        router.back();
    };

    const markAsComplete = async () => {
        if (!task) return;

        const updatedTask = {
            ...task,
            status: true,
            completedAt: new Date().toISOString(),
        };

        const tasksList = await loadTasks();
        const updatedTasksList = tasksList.map((t) =>
            t.id === task.id ? updatedTask : t
        );

        await saveTasks(updatedTasksList);
        setTask(updatedTask);
        router.back();
    };

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Loading task details... {id}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Task Details</Text>

            <Text style={styles.label}>Created Date : {task.createdAt.split("T")[0]}</Text>
            <Text style={styles.label}>
                Completed Date: {task.completedAt || "Not completed yet"}
            </Text>

            <Text style={styles.label}>Edit Title:</Text>
            <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
            />

            <Text style={styles.label}>Edit Description:</Text>
            <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={updateTaskDetails}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            {!task.status && (
                <TouchableOpacity style={styles.completeButton} onPress={markAsComplete}>
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </TouchableOpacity>
            )}
            <Toast/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 10,
    },
    input: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    completeButton: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    completeButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
