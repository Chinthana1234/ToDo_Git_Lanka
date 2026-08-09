<?php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller {
    public function index(Request $request) {
        $query = $request->user()->todos();
        
        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        if ($request->has('status') && $request->status != 'all') {
            $is_completed = $request->status == 'completed' ? true : false;
            $query->where('is_completed', $is_completed);
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'title' => 'required|string|max:255'
        ]);
        $todo = $request->user()->todos()->create($validated);
        return response()->json($todo, 201);
    }

    public function update(Request $request, Todo $todo) {
        if ($request->user()->id !== $todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean'
        ]);
        $todo->update($validated);
        return response()->json($todo);
    }

    public function destroy(Request $request, Todo $todo) {
        if ($request->user()->id !== $todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $todo->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
