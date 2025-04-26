import React, { useEffect, useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Easing,
    ScrollView,
    Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Task } from "../../Types/Task";
import { getTaskById, saveTasks, loadTasks } from "../../Utils/TaskStorage";
import Toast from "react-native-toast-message";
import { theme } from "../../Utils/theme";
import { Ionicons } from '@expo/vector-icons';

export default function TaskDetail() {
    const { id } = useLocalSearchParams();
    const [task, setTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDuration, setEditDuration] = useState(0);
    const router = useRouter();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        const fetchTask = async () => {
            if (!id) return;
            const numericId = Number(id);
            if (isNaN(numericId)) {
                console.error("Invalid task ID");
                return;
            }
            const taskData = await getTaskById(numericId);
            setTask(taskData);
            if (taskData) {
                setEditTitle(taskData.title);
                setEditDescription(taskData.description);
                setEditDuration(taskData.duration);
            }
        };
        fetchTask();
    }, [id]);

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

    const updateTaskDetails = async () => {
        if (!task) return;

        if (editTitle.length > 25) {
            Toast.show({ type: "error", text1: "Title's can have only maximum 25 characters" });
            return;
        }

        if (!editTitle.trim() || !editDescription.trim()) {
            Toast.show({ type: "error", text1: "Both fields must be filled" });
            return;
        }

        const d = new Date(task.createdAt);
        d.setTime(d.getTime() + editDuration * 24 * 60 * 60 * 1000);

        const updatedTask = {
            ...task,
            title: editTitle,
            description: editDescription,
            duration: editDuration,
            deadline: d.toISOString(),
        };

        const tasksList = await loadTasks();
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
                <Text>Loading task details...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Task Details</Text>
                </View>

                <View style={styles.taskContainer}>
                    <View style={styles.dateContainer}>
                        <View style={styles.dateItem}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
                            <Text style={styles.dateLabel}>Created</Text>
                            <Text style={styles.dateText}>{new Date(task.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
                            <Text style={styles.dateLabel}>Deadline</Text>
                            <Text style={styles.dateText}>{new Date(task.deadline).toLocaleDateString()}</Text>
                        </View>
                        {task.completedAt && (
                            <View style={styles.dateItem}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.status.success} />
                                <Text style={styles.dateLabel}>Completed</Text>
                                <Text style={styles.dateText}>{new Date(task.completedAt).toLocaleDateString()}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Enter task title"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Enter task description"
                            multiline
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Duration</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editDuration)}
                            onChangeText={(text) => setEditDuration(Number(text))}
                            placeholder="Enter the new task duration"
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={() => handleButtonPress(updateTaskDetails)}
                        >
                            <Ionicons name="save-outline" size={20} color={theme.colors.surface} />
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>

                        {!task.status && (
                            <TouchableOpacity
                                style={[styles.button, styles.completeButton]}
                                onPress={() => handleButtonPress(markAsComplete)}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.surface} />
                                <Text style={styles.buttonText}>Mark Complete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>
            <Toast />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    backButton: {
        padding: theme.spacing.sm,
        marginRight: theme.spacing.md,
    },
    header: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    taskContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    dateItem: {
        alignItems: 'center',
    },
    dateLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    dateText: {
        ...theme.typography.body,
        color: theme.colors.text.primary,
        marginTop: theme.spacing.xs,
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.text.primary,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: theme.spacing.xl,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    completeButton: {
        backgroundColor: theme.colors.status.success,
    },
    buttonText: {
        ...theme.typography.body,
        color: theme.colors.surface,
        marginLeft: theme.spacing.sm,
        fontWeight: '600',
    },
});
