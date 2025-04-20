import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../Types/Task";

const TASK_STORAGE_KEY = "tasks";

// Save tasks to AsyncStorage
export const saveTasks = async (tasks: Task[]) => {
    try {
        await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
};

// Load tasks from AsyncStorage
export const loadTasks = async (): Promise<Task[]> => {
    try {
        const storedTasks = await AsyncStorage.getItem(TASK_STORAGE_KEY);
        return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
};