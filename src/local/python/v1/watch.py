import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class DirectoryEventHandler(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback
        self.last_callback_time = time.time()

    def on_modified(self, event):
        if event.is_directory:
            return
        now = time.time()
        if (now - self.last_callback_time) < 1.0:  
            return
        try:
            self.callback(event)
        except Exception as e:
            print('Error in watch callback: ', e)
        print('watch callback ran at', time.strftime("%Y-%m-%d %H:%M:%S",  time.localtime(now)))
        self.last_callback_time = now


def watch_directory(directory: str, callback):
    event_handler = DirectoryEventHandler(callback)
    observer = Observer()
    observer.schedule(event_handler, path=directory, recursive=True)
    
    try:
        observer.start()
        print(f"Watching directory: {directory}")
        while True:
            time.sleep(1)  # Keep the script running to watch for changes
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    watch_directory('assets', lambda event: print(f"File changed: {event.src_path}"))