<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
 
class AuthController extends Controller
{
    public function login(Request $r)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $data['email'])->where('role', 'admin')->first();
 
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect email or password.'], 422);
        }
        return ['token' => $user->createToken('admin')->plainTextToken, 'user' => $user];
    }
 
    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return ['message' => 'Logged out.'];
    }
 
    public function me(Request $r) { return $r->user(); }
}
