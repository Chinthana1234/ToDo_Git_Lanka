<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Todo extends Model {
    use HasFactory;
    
    protected $fillable = ['user_id', 'title', 'description', 'due_date', 'image', 'is_completed'];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'is_completed' => 'boolean',
        ];
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}

