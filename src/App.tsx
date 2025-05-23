import automergeLogo from "/automerge.png";
import "@picocss/pico/css/pico.min.css";
import "./App.css";
import { useDocument, updateText, type AutomergeUrl } from "@automerge/react";
import { useCallback } from "react";

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  columns: TaskList[];
}

function Task({ 
  task, 
  columnIdx, 
  taskIdx, 
  onToggle, 
  onUpdateTitle 
}: {
  task: Task;
  columnIdx: number;
  taskIdx: number;
  onToggle: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  return (
    <div className="task">
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
      />
      <input
        type="text"
        placeholder="What needs doing?"
        value={task.title}
        onChange={(e) => onUpdateTitle(e.target.value)}
        style={task.done ? { textDecoration: "line-through" } : {}}
      />
    </div>
  );
}

function Column({ 
  docUrl, 
  columnIdx 
}: { 
  docUrl: AutomergeUrl; 
  columnIdx: number;
}) {
  const [doc, changeDoc] = useDocument<Board>(docUrl);

  const handleTitleChange = useCallback((e: React.FormEvent<HTMLHeadingElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    changeDoc((d) => {
      if (!d.columns[columnIdx]) return;
      updateText(d, ['columns', columnIdx, "title"], newTitle);
    });
  }, [changeDoc, columnIdx]);

  const handleAddTask = useCallback(() => {
    changeDoc((d) => {
      if (!d.columns[columnIdx]) return;
      d.columns[columnIdx].tasks.unshift({
        id: crypto.randomUUID(),
        title: "",
        done: false,
      });
    });
  }, [changeDoc, columnIdx]);

  const handleToggleTask = useCallback((taskIdx: number) => {
    changeDoc((d) => {
      if (!d.columns[columnIdx]?.tasks[taskIdx]) return;
      d.columns[columnIdx].tasks[taskIdx].done = !d.columns[columnIdx].tasks[taskIdx].done;
    });
  }, [changeDoc, columnIdx]);

  const handleUpdateTaskTitle = useCallback((taskIdx: number, title: string) => {
    changeDoc((d) => {
      if (!d.columns[columnIdx]?.tasks[taskIdx]) return;
      updateText(d, ['columns', columnIdx, 'tasks', taskIdx, "title"], title);
    });
  }, [changeDoc, columnIdx]);

  if (!doc?.columns?.[columnIdx]) {
    return null;
  }

  const column = doc.columns[columnIdx];

  return (
    <article>
      <h3 
        contentEditable
        onBlur={handleTitleChange}
        suppressContentEditableWarning={true}
      >
        {column.title || ""}
      </h3>

      <button type="button" onClick={handleAddTask}>
        <b>+</b> New task
      </button>

      <div id="task-list">
        {column.tasks?.map((task, taskIdx) => (
          <Task
            key={task.id}
            task={task}
            columnIdx={columnIdx}
            taskIdx={taskIdx}
            onToggle={() => handleToggleTask(taskIdx)}
            onUpdateTitle={(title) => handleUpdateTaskTitle(taskIdx, title)}
          />
        ))}
      </div>
    </article>
  );
}

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const [doc, changeDoc] = useDocument<Board>(docUrl);

  const handleAddColumn = useCallback(() => {
    changeDoc((d) => {
      d.columns.push({
        id: crypto.randomUUID(),
        tasks: [],
        title: "",
      });
    });
  }, [changeDoc]);

  return (
    <>
      <header>
        <h1>
          <img src={automergeLogo} alt="Automerge logo" id="automerge-logo" />
          Automerge Task List
        </h1>
      </header>

      <div className="board">
        {doc?.columns?.map((column, columnIdx) => (
          <Column 
            key={column.id} 
            docUrl={docUrl} 
            columnIdx={columnIdx}
          />
        ))}

        <button type="button" onClick={handleAddColumn}>
          <b>+</b> New column
        </button>
      </div>

      <footer>
        <p className="read-the-docs">
          Powered by Automerge + Vite + React + TypeScript
        </p>
      </footer>
    </>
  );
}

export default App;