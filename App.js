import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';

function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    };
    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        slideAnim: new Animated.Value(0),
      };
      setTasks([...tasks, newTask]);

      // Add animation for task addition
      Animated.timing(newTask.slideAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();

      setTask('');
      Keyboard.dismiss();
    }
  };

  const deleteTask = (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];

    // Add animation for task deletion
    Animated.timing(task.slideAnim, {
      toValue: 700,
      duration: 50000,
      useNativeDriver: true,
    }).start(() => {
      setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
    });
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const startEditingTask = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditingText(currentText);
  };

  const updateTask = () => {
    setTasks(
      tasks.map((item) =>
        item.id === editingTaskId ? { ...item, text: editingText } : item
      )
    );
    setEditingTaskId(null);
    setEditingText('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Simple To-Do List</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task to the list"
            value={task}
            onChangeText={(text) => setTask(text)}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <Animated.View
              style={[
                styles.taskContainer,
                {
                  transform: [
                    {
                      translateX: item.slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {editingTaskId === item.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editingText}
                    onChangeText={setEditingText}
                  />
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={updateTask}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditingTaskId(null)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableWithoutFeedback
                  onPress={() => startEditingTask(item.id, item.text)}
                  onLongPress={() => toggleTaskCompletion(item.id)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      item.completed && styles.completedTaskText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableWithoutFeedback>
              )}
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#28A888',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#A9A9A9',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF5C5C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 5,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

registerRootComponent(App);