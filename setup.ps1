$ErrorActionPreference = "Stop"

$php = "C:\xampp\php\php.exe"
if (!(Test-Path $php)) {
    Write-Host "PHP not found at C:\xampp\php\php.exe"
    exit 1
}

# Step 1: Backend Initialization & PostgreSQL Configuration
Write-Host "Step 1"
# We run composer.bat
& .\composer.bat create-project laravel/laravel backend --no-interaction
Set-Location backend
# Use laravel 11 default API installation
& $php artisan install:api --no-interaction
Set-Location ..

$envContent = @"
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tododb
DB_USERNAME=postgres
DB_PASSWORD=secret
"@
(Get-Content backend/.env) -replace 'DB_CONNECTION=sqlite', $envContent | Set-Content backend/.env

git add .
git commit -m "Initialize Laravel backend and configure PostgreSQL"

# Step 2: Create Todo Model and Migration
Write-Host "Step 2"
Set-Location backend
& $php artisan make:model Todo -m --no-interaction
Set-Location ..

$migrationFile = Get-ChildItem backend/database/migrations/*_create_todos_table.php | Select-Object -First 1
$migrationContent = @"
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('todos', function (Blueprint `$table) {
            `$table->id();
            `$table->foreignId('user_id')->constrained()->onDelete('cascade');
            `$table->string('title');
            `$table->boolean('is_completed')->default(false);
            `$table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('todos');
    }
};
"@
Set-Content $migrationFile.FullName $migrationContent

$modelContent = @"
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Todo extends Model {
    use HasFactory;
    
    protected `$fillable = ['user_id', 'title', 'is_completed'];
    
    public function user() {
        return `$this->belongsTo(User::class);
    }
}
"@
Set-Content backend/app/Models/Todo.php $modelContent

git add .
git commit -m "Create Todo model and migration"

# Step 3: Implement Authentication Controller
Write-Host "Step 3"
$authControllerContent = @"
<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    public function register(Request `$request) {
        `$validated = `$request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);
        `$user = User::create([
            'name' => `$validated['name'],
            'email' => `$validated['email'],
            'password' => Hash::make(`$validated['password']),
        ]);
        `$token = `$user->createToken('auth_token')->plainTextToken;
        return response()->json(['access_token' => `$token, 'token_type' => 'Bearer']);
    }

    public function login(Request `$request) {
        if (!auth()->attempt(`$request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }
        `$user = User::where('email', `$request['email'])->firstOrFail();
        `$token = `$user->createToken('auth_token')->plainTextToken;
        return response()->json(['access_token' => `$token, 'token_type' => 'Bearer']);
    }

    public function logout(Request `$request) {
        `$request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
"@
Set-Content backend/app/Http/Controllers/AuthController.php $authControllerContent
git add .
git commit -m "Implement Authentication API"

# Step 4: Implement Todo Controller
Write-Host "Step 4"
$todoControllerContent = @"
<?php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller {
    public function index(Request `$request) {
        `$query = `$request->user()->todos();
        
        if (`$request->has('search') && `$request->search != '') {
            `$query->where('title', 'like', '%' . `$request->search . '%');
        }
        
        if (`$request->has('status') && `$request->status != 'all') {
            `$is_completed = `$request->status == 'completed' ? true : false;
            `$query->where('is_completed', `$is_completed);
        }
        
        return response()->json(`$query->get());
    }

    public function store(Request `$request) {
        `$validated = `$request->validate([
            'title' => 'required|string|max:255'
        ]);
        `$todo = `$request->user()->todos()->create(`$validated);
        return response()->json(`$todo, 201);
    }

    public function update(Request `$request, Todo `$todo) {
        if (`$request->user()->id !== `$todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        `$validated = `$request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean'
        ]);
        `$todo->update(`$validated);
        return response()->json(`$todo);
    }

    public function destroy(Request `$request, Todo `$todo) {
        if (`$request->user()->id !== `$todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        `$todo->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
"@
Set-Content backend/app/Http/Controllers/TodoController.php $todoControllerContent
git add .
git commit -m "Implement Todo CRUD and search API"

# Step 5: Configure API Routes
Write-Host "Step 5"
$apiRoutesContent = @"
<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::put('/todos/{todo}', [TodoController::class, 'update']);
    Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);
    
    Route::get('/user', function (Request `$request) {
        return `$request->user();
    });
});
"@
Set-Content backend/routes/api.php $apiRoutesContent
git add .
git commit -m "Configure API routes"

# Step 6: Frontend Initialization & Tailwind CSS
Write-Host "Step 6"
# Create next app without interactive prompts
npx -y create-next-app@latest frontend --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

$globalsCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@
Set-Content frontend/src/app/globals.css $globalsCss
git add .
git commit -m "Initialize Next.js frontend with Tailwind CSS"

# Step 7: Setup Axios Client
Write-Host "Step 7"
Set-Location frontend
npm install axios
Set-Location ..
New-Item -ItemType Directory -Force frontend/src/lib
$axiosContent = @"
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = ``Bearer `$`{token}``;
        }
    }
    return config;
});

export default axiosInstance;
"@
Set-Content frontend/src/lib/axios.js $axiosContent
git add .
git commit -m "Setup Axios client for API requests"

# Step 8: Implement Authentication Context
Write-Host "Step 8"
New-Item -ItemType Directory -Force frontend/src/context
$authContextContent = @"
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/user');
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        const userRes = await axios.get('/user');
        setUser(userRes.data);
        router.push('/dashboard');
    };

    const register = async (name, email, password) => {
        const res = await axios.post('/register', { name, email, password });
        localStorage.setItem('token', res.data.access_token);
        const userRes = await axios.get('/user');
        setUser(userRes.data);
        router.push('/dashboard');
    };

    const logout = async () => {
        await axios.post('/logout');
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
"@
Set-Content frontend/src/context/AuthContext.js $authContextContent
git add .
git commit -m "Implement Authentication Context"

# Step 9: Create Login Page
Write-Host "Step 9"
New-Item -ItemType Directory -Force frontend/src/app/login
$loginContent = @"
"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-4 text-black">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-2 border rounded text-black" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded text-black" required />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
                <p className="mt-4 text-black">No account? <Link href="/register" className="text-blue-500">Register</Link></p>
            </form>
        </div>
    );
}
"@
Set-Content frontend/src/app/login/page.js $loginContent
git add .
git commit -m "Create Login page"

# Step 10: Create Register Page
Write-Host "Step 10"
New-Item -ItemType Directory -Force frontend/src/app/register
$registerContent = @"
"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl mb-4 text-black">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded text-black" required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-2 border rounded text-black" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded text-black" required />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
                <p className="mt-4 text-black">Have account? <Link href="/login" className="text-blue-500">Login</Link></p>
            </form>
        </div>
    );
}
"@
Set-Content frontend/src/app/register/page.js $registerContent
git add .
git commit -m "Create Register page"

# Step 11: Create Navbar Component
Write-Host "Step 11"
New-Item -ItemType Directory -Force frontend/src/components
$navbarContent = @"
"use client";
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">TodoApp</Link>
            <div>
                {user ? (
                    <div className="flex items-center gap-4">
                        <span>{user.name}</span>
                        <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link>
                        <Link href="/register" className="bg-white text-blue-600 px-3 py-1 rounded">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
"@
Set-Content frontend/src/components/Navbar.js $navbarContent
git add .
git commit -m "Create Navbar component"

# Step 12: Create Todo Form Component
Write-Host "Step 12"
$todoFormContent = @"
"use client";
import { useState } from 'react';
import axios from '../lib/axios';

export default function TodoForm({ onTodoAdded }) {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            const res = await axios.post('/todos', { title });
            onTodoAdded(res.data);
            setTitle('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input type="text" placeholder="Add a new todo..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 p-2 border rounded text-black" required />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
        </form>
    );
}
"@
Set-Content frontend/src/components/TodoForm.js $todoFormContent
git add .
git commit -m "Create Todo form component"

# Step 13: Create Todo Item Component
Write-Host "Step 13"
$todoItemContent = @"
"use client";
import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleUpdate = () => {
        onUpdate(todo.id, { title: editTitle });
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-3">
                <input type="checkbox" checked={todo.is_completed} onChange={() => onUpdate(todo.id, { is_completed: !todo.is_completed })} className="h-5 w-5" />
                {isEditing ? (
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border p-1 text-black" />
                ) : (
                    <span className={`text-black `$`{todo.is_completed ? 'line-through text-gray-500' : ''}``}>{todo.title}</span>
                )}
            </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <button onClick={handleUpdate} className="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                )}
                <button onClick={() => onDelete(todo.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
        </div>
    );
}
"@
Set-Content frontend/src/components/TodoItem.js $todoItemContent
git add .
git commit -m "Create Todo Item component"

# Step 14: Create Main Dashboard Page
Write-Host "Step 14"
New-Item -ItemType Directory -Force frontend/src/app/dashboard
$dashboardContent = @"
"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import TodoForm from '../../components/TodoForm';
import TodoItem from '../../components/TodoItem';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [todos, setTodos] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchTodos = useCallback(async () => {
        try {
            const res = await axios.get(``/todos?search=`$`{search}&status=`$`{filter}``);
            setTodos(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [search, filter]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchTodos();
    }, [user, router, fetchTodos]);

    const handleAdd = (newTodo) => setTodos([...todos, newTodo]);

    const handleUpdate = async (id, data) => {
        try {
            const res = await axios.put(``/todos/`$`{id}``, data);
            setTodos(todos.map((t) => (t.id === id ? res.data : t)));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(``/todos/`$`{id}``);
            setTodos(todos.filter((t) => t.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-black">My Todos</h1>
                <TodoForm onTodoAdded={handleAdd} />
                <div className="flex gap-4 mb-6">
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded text-black flex-1" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded text-black">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    {todos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
                    ))}
                </div>
            </div>
        </div>
    );
}
"@
Set-Content frontend/src/app/dashboard/page.js $dashboardContent
git add .
git commit -m "Create Main Dashboard Page"

# Step 15: Root Layout and Context Provider
Write-Host "Step 15"
$layoutContent = @"
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
"@
Set-Content frontend/src/app/layout.js $layoutContent
$pageContent = @"
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-black">Welcome to TodoApp</h1>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded shadow">Login</Link>
        <Link href="/register" className="bg-green-500 text-white px-6 py-2 rounded shadow">Register</Link>
      </div>
    </div>
  );
}
"@
Set-Content frontend/src/app/page.js $pageContent
git add .
git commit -m "Configure Layout and Home Page"
Write-Host "All 15 steps completed!"
