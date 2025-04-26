import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { Link } from "expo-router";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native"; // For focus listener
import { loadTasks } from "../../Utils/TaskStorage";
import { Task } from "../../Types/Task";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../Utils/theme";
import { Ionicons } from '@expo/vector-icons';

export default function Completed() {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const fetchTasks = async () => {
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks);
    };

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

    const completedTasks = tasks
        .filter((task) => task.status === true)
        .sort((a, b) => {
            const dateA = new Date(a.completedAt || 0).getTime();
            const dateB = new Date(b.completedAt || 0).getTime();
            return dateB - dateA; // Descending order
        })
        .slice(0, 20);

    const renderTask = ({ item, index }: { item: Task; index: number }) => (
        <Animated.View
            style={[
                styles.task,
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
            <TouchableOpacity 
                style={styles.taskContent}
                activeOpacity={0.7}
            >
                <Link href={`/Tasks/${item.id}`}>
                    <View style={styles.taskRow}>
                        <View style={styles.checkIconContainer}>
                            <Ionicons 
                                name="checkmark-circle" 
                                size={24} 
                                color={theme.colors.status.success} 
                            />
                        </View>
                        <Text style={styles.taskTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </View>
                </Link>
            </TouchableOpacity>
        </Animated.View>
    );

    // Fetch tasks when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    return (
        <View style={styles.container}>
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
                    <Text style={styles.header}>Completed Tasks</Text>
                    <Text style={styles.subHeader}> Latest Completed {completedTasks.length} tasks</Text>
                </View>
                
                <FlatList
                    data={completedTasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTask}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Animated.View
                            style={[
                                styles.emptyContainer,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <Ionicons 
                                name="trophy-outline" 
                                size={64} 
                                color={theme.colors.status.success} 
                            />
                            <Text style={styles.emptyText}>No completed tasks yet</Text>
                            <Text style={styles.emptySubText}>Complete some tasks to see them here!</Text>
                        </Animated.View>
                    }
                    contentContainerStyle={[
                        styles.listContainer,
                        completedTasks.length === 0 && styles.emptyListContainer
                    ]}
                />
            </Animated.View>
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    headerContainer: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        fontSize: theme.typography.h1.fontSize,
        fontWeight: '700' as const,
        color: theme.colors.text.primary,
        textAlign: "center",
    },
    subHeader: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    listContainer: {
        paddingBottom: theme.spacing.xl,
    },
    task: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    taskContent: {
        padding: theme.spacing.md,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIconContainer: {
        marginRight: theme.spacing.md,
    },
    taskTitle: {
        flex: 1,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.primary,
        fontWeight: "600" as const,
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
        fontSize: theme.typography.h2.fontSize,
        fontWeight: '600' as const,
        color: theme.colors.text.primary,
        textAlign: "center",
        marginTop: theme.spacing.lg,
    },
    emptySubText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
        textAlign: "center",
        marginTop: theme.spacing.sm,
    },
});
