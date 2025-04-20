import React from "react";
import {Text, View, StyleSheet, Button} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function TaskDetail() {
    const { id } = useLocalSearchParams(); // Fetch task ID from route params
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Task Details</Text>
            <Text>Task ID: {id}</Text>
            <Text>More task details coming soon...</Text>
            <Button title="Go Back" onPress={() => router.back()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
});
