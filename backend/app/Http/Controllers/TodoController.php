<?php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
        
        return response()->json(
            $query->orderByRaw('due_date IS NULL, due_date ASC')->orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('todo_images', 'public');
        }

        $todo = $request->user()->todos()->create($data);
        return response()->json($todo->fresh(), 201);
    }

    public function update(Request $request, Todo $todo) {
        if ($request->user()->id !== $todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'due_date' => 'nullable|date',
            'is_completed' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'remove_image' => 'sometimes|boolean',
        ]);

        $data = collect($validated)->except(['image', 'remove_image'])->toArray();

        // Handle image removal
        if ($request->boolean('remove_image')) {
            if ($todo->image) {
                Storage::disk('public')->delete($todo->image);
            }
            $data['image'] = null;
        }

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($todo->image) {
                Storage::disk('public')->delete($todo->image);
            }
            $data['image'] = $request->file('image')->store('todo_images', 'public');
        }

        $todo->update($data);
        return response()->json($todo->fresh());
    }

    public function destroy(Request $request, Todo $todo) {
        if ($request->user()->id !== $todo->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        // Delete associated image
        if ($todo->image) {
            Storage::disk('public')->delete($todo->image);
        }
        $todo->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
