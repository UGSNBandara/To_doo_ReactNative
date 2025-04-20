import { Tabs } from "expo-router";
import React from 'react';
import { Image, View, StyleSheet } from "react-native";
import { icons } from "../../assest/Constant/Icon";

const _Layout = () => {
    return (
        <View style={styles.container}>
        <Tabs
            screenOptions={{
                tabBarItemStyle : {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',

                },
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderRadius:20,
                    marginHorizontal: 20,
                    marginBottom: 20,
                    height: 50,
                    paddingTop: 5.5,
                }
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.focusedBackground]}>
                            <Image
                                source={icons.home}
                                style={[styles.icon, focused && styles.focusedIcon]}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="completed"
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.focusedBackground]}>
                            <Image
                                source={icons.complete}
                                style={[styles.icon, focused && styles.focusedIcon]}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.iconContainer, focused && styles.focusedBackground]}>
                            <Image
                                source={icons.profile}
                                style={[styles.icon, focused && styles.focusedIcon]}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
        </View>
    );
};

export default _Layout;

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 110,
        height: 45,
        borderRadius: 18,
    },
    focusedBackground: {
        backgroundColor: '#000000',
    },
    icon: {
        width: 26,
        height: 26,
        tintColor: 'gray',
    },
    focusedIcon: {
        tintColor: '#ffffff',
    },
    container: {
        flex: 1, // Ensures the container spans the entire screen
        backgroundColor: '#ffffff', // Background color of the entire screen
        justifyContent: "flex-end", // Ensures the Tabs are positioned correctly
    },
});
