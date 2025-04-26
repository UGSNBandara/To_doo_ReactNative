import React, {useCallback, useEffect, useState, useRef} from "react";
import {Text, View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Animated, Easing} from "react-native";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import { loadTasks, saveTasks } from "../../Utils/TaskStorage";
import { Task } from "../../Types/Task";
import {useFocusEffect} from "@react-navigation/native";
import { theme } from "../../Utils/theme";
import { Ionicons } from '@expo/vector-icons';
import styles from "react-native-webview/lib/WebView.styles";
import {is} from "@babel/types";


export default function Index() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(1);

    const today = new Date().toISOString().split("T")[0];

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const fetchTasks = async () => {
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        // Start animations when component mounts
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
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleButtonPress = (callback: () => void) => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => callback());
    };

    const addTask = async () => {
        if (!title.trim() || !description.trim()) {
            Toast.show({type: "error", text1: "Validation Error", text2: "All fields are required"});
            return;
        }

        if (title.length > 25){
            Toast.show({type: "error", text1: "Title's can have only maximum 25 characters"});
            return;
        }

        const day = new Date();
        day.setTime(day.getTime() + duration * 24 * 60 * 60 * 1000);

        const newTask: Task = {
            id: Date.now(),
            title: title,
            description: description,
            status: false,
            createdAt: new Date().toISOString(),
            completedAt: '',
            duration: duration,
            deadline: day.toISOString(),
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


    const pendingTasks = tasks
        .filter((task) => task.status === false)
        .sort((a, b) => {
            const dateA = new Date(a.deadline || 0).getTime();
            const dateB = new Date(b.deadline || 0).getTime();
            return dateA - dateB;
        });

    const renderTask = ({ item, index }: { item: Task; index: number }) =>{

        const isDeadlineSoon = new Date(item.deadline).getTime() - Date.now() < 24*60*60 * 1000;

        return(
            <Animated.View
                style={[
                    task,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, index * 20]
                                })}
                        ]
                    }
                ]}
            >

                <TouchableOpacity onPress={() => {}}>

                    <Link href={`/Tasks/${item.id}`}>
                        <Text style={isDeadlineSoon ? taskTitle2 : taskTitle1}>{item.title}</Text>
                    </Link>
                </TouchableOpacity>
                <TouchableOpacity
                    style={isDeadlineSoon ? completeButton2 : completeButton1}
                    onPress={() => handleButtonPress(() => markTaskAsCompleted(item.id))}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.surface} />
                    <Text style={completeButtonText}>Complete</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    return (
        <View style={container}>

            <Animated.View
                style={[
                    content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <Text style={header}>Pending Tasks</Text>
                <FlatList
                    data={pendingTasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTask}
                    ListEmptyComponent={
                        <Animated.View
                            style={[
                                emptyContainer,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <Ionicons name="checkmark-done-circle-outline" size={48} color={theme.colors.text.secondary} />
                            <Text style={emptyText}>No pending tasks 🎉</Text>
                        </Animated.View>
                    }
                    contentContainerStyle={pendingTasks.length === 0 ? emptyListContainer : undefined}
                />
                <TouchableOpacity 
                    style={addTaskButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color={theme.colors.surface} />
                    <Text style={addTaskButtonText}>Add Task</Text>
                </TouchableOpacity>
            </Animated.View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalOverlay}>
                    <Animated.View
                        style={[
                            modalContent,
                            {
                                transform: [
                                    { translateY: slideAnim }
                                ]
                            }
                        ]}
                    >
                        <View style={modalHeader}>
                            <Text style={modalTitle}>Add New Task</Text>
                            <TouchableOpacity
                                style={closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={input}
                            placeholder="Task Title"
                            placeholderTextColor={theme.colors.text.light}
                            value={title}
                            onChangeText={(text) => setTitle(text)}
                        />
                        <TextInput
                            style={[input, textArea]}
                            placeholder="Task Description"
                            placeholderTextColor={theme.colors.text.light}
                            value={description}
                            onChangeText={(text) => setDescription(text)}
                            multiline
                        />

                        <TextInput
                        style={[input]}
                        placeholder="Task Duration in Days"
                        placeholderTextColor={theme.colors.text.light}
                        value={duration}
                        onChangeText={(text) => setDuration(Number(text))}
                        />

                        <View style={modalButtons}>
                            <TouchableOpacity
                                style={[modalButton, cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalButton, addButton]}
                                onPress={() => handleButtonPress(addTask)}
                            >
                                <Ionicons name="add-circle-outline" size={20} color={theme.colors.surface} />
                                <Text style={addButtonText}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            <Toast />
        </View>
    );
}

const {
    addButton,
    addButtonText,
    addTaskButton,
    addTaskButtonText,
    cancelButton,
    cancelButtonText,
    closeButton,
    completeButton1,
    completeButton2,
    completeButtonText,
    container,
    content,
    emptyContainer,
    emptyListContainer,
    emptyText,
    header,
    input,
    modalButton,
    modalButtons,
    modalContent,
    modalHeader,
    modalOverlay,
    modalTitle,
    task,
    taskTitle1,
    taskTitle2,
    textArea
} = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    header: {
        ...theme.typography.h1,
        marginBottom: theme.spacing.xl,
        color: theme.colors.text.primary,
        textAlign: "center",
    },
    task: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    taskTitle1: {
        ...theme.typography.body,
        color: theme.colors.text.primary,
        fontWeight: "600",
    },
    taskTitle2: {
        ...theme.typography.body,
        color: theme.colors.text.end,
        fontWeight: "600",
    },
    completeButton1: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    completeButton2: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.end,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    completeButtonText: {
        color: theme.colors.surface,
        marginLeft: theme.spacing.xs,
        fontWeight: "600",
    },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginTop: theme.spacing.lg,
        ...theme.shadows.md,
    },
    addTaskButtonText: {
        color: theme.colors.surface,
        marginLeft: theme.spacing.sm,
        ...theme.typography.body,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        textAlign: "center",
        marginTop: theme.spacing.md,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        ...theme.shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text.primary,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.lg,
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginHorizontal: theme.spacing.xs,
    },
    cancelButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    addButtonText: {
        ...theme.typography.body,
        color: theme.colors.surface,
        marginLeft: theme.spacing.xs,
        fontWeight: '600',
    },

});
