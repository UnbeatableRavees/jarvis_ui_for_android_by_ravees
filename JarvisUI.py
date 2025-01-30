import tkinter as tk
from tkinter import messagebox
import pyttsx3
import speech_recognition as sr
import requests
import time
from threading import Thread

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Set the rate and volume for speech
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0)

# Function to speak the text
def speak(text):
    engine.say(text)
    engine.runAndWait()

# Function to fetch the weather data
def fetch_weather():
    try:
        # Replace with your actual OpenWeatherMap API key
        api_key = 'YOUR_OPENWEATHERMAP_API_KEY'
        city = 'Delhi'
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric'
        response = requests.get(url)
        data = response.json()
        weather_data = f"The weather in {city} is {data['weather'][0]['description']} with a temperature of {data['main']['temp']}°C."
        return weather_data
    except Exception as e:
        return "Error fetching weather."

# Function to fetch news
def fetch_news():
    try:
        # Replace with your actual News API key
        api_key = 'YOUR_NEWS_API_KEY'
        url = f'https://newsapi.org/v2/top-headlines?country=in&apiKey={api_key}'
        response = requests.get(url)
        articles = response.json()['articles'][:3]
        news_data = "Top News: " + '. '.join([article['title'] for article in articles])
        return news_data
    except Exception as e:
        return "Error fetching news."

# Function to handle voice input and execute commands
def listen():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    
    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Listening for commands...")
        audio = recognizer.listen(source)
    
    try:
        command = recognizer.recognize_google(audio).lower()
        print(f"Command received: {command}")
        execute_command(command)
    except sr.UnknownValueError:
        print("Sorry, I didn't catch that.")
        speak("Sorry, I didn't catch that.")
    except sr.RequestError:
        print("Could not request results from Google Speech Recognition service.")
        speak("Could not request results from the service.")

# Function to handle commands
def execute_command(command):
    if 'hello' in command:
        response = "Hi there! How can I assist you today?"
    elif 'time' in command:
        response = time.strftime("%H:%M:%S")
    elif 'date' in command:
        response = time.strftime("%Y-%m-%d")
    elif 'weather' in command:
        response = fetch_weather()
    elif 'news' in command:
        response = fetch_news()
    else:
        response = "Command not recognized."

    responses.insert(tk.END, "Jarvis: " + response)
    speak(response)

# Function to start listening for commands
def start_listening():
    listen_thread = Thread(target=listen)
    listen_thread.start()

# Creating the main window using Tkinter
root = tk.Tk()
root.title("Jarvis")

# Set up the window size and background color
root.geometry("500x400")
root.configure(bg="gray")

# Label to display the name of the assistant
title_label = tk.Label(root, text="Jarvis", font=("Arial", 24), bg="gray", fg="white")
title_label.pack(pady=20)

# Listbox to display responses
responses = tk.Listbox(root, width=60, height=10, bg="black", fg="white", font=("Arial", 12))
responses.pack(pady=10)

# Input field for typing commands
user_input = tk.Entry(root, width=40, font=("Arial", 12))
user_input.pack(pady=10)

# Function to handle button click for submitting typed command
def handle_command_submit():
    command = user_input.get().strip().lower()
    if command:
        execute_command(command)
    user_input.delete(0, tk.END)

# Button to submit the typed command
submit_button = tk.Button(root, text="Send Command", font=("Arial", 14), command=handle_command_submit)
submit_button.pack(pady=10)

# Button to start listening for voice commands
listen_button = tk.Button(root, text="Listen", font=("Arial", 14), command=start_listening)
listen_button.pack(pady=10)

# Run the main loop to display the Tkinter window
root.mainloop()
