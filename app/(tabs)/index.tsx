import React, {useCallback, useEffect, useState} from "react";
import {Text, View, FlatList, Button, StyleSheet, TouchableOpacity, Modal, TextInput} from "react-native";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import { loadTasks, saveTasks } from "../../Utils/TaskStorage";
import { Task } from "../../Types/Task";
import {useFocusEffect} from "@react-navigation/native";

export default function Index() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    const fetchTasks = async () => {
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async () => {
        if (!title.trim() || !description.trim()) {
            Toast.show({type: "error", text1: "Validation Error", text2: "All fields are required"});
            return;
        }

        if (title.length > 25){
            Toast.show({type: "error", text1: "Title's can have only maximum 53 characters"});
            return;
        }

        const newTask: Task = {
            id: Date.now(),
            title: title,
            description: description,
            status: false,
            createdAt: new Date().toISOString(),
            completedAt: '',
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
        setModalVisible(false);
        setTitle("");
        setDescription("");
        Toast.show({ type: "success", text1: "Task added!", text2: newTask.title });
    };

    const markTaskAsCompleted = async (taskId: number) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, status: true, completedAt: new Date().toISOString()} : task
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

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
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
            <TouchableOpacity style={styles.addTaskButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addTaskButtonText}>+ Add Task</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Task</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Task Title"
                            value={title}
                            onChangeText={(text) => setTitle(text)}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Task Description"
                            value={description}
                            onChangeText={(text) => setDescription(text)}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                            <Button title="Add Task" onPress={addTask} />
                        </View>
                    </View>
                </View>
            </Modal>

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
        backgroundColor: "#007BFF",
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
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    textArea: {
        height: 60,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
});
