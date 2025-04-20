import { View } from "react-native";
import { Stack } from "expo-router";

export default function TasksLayout() {
    return (
        <Stack>
            <Stack.Screen
            name="[id]"
            options={{
            headerShown: false,}
            }
            />
        </Stack>
    );
}
