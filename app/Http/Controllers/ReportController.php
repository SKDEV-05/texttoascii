<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Store a user report.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'reported_id' => 'required|exists:users,id',
            'conversation_id' => 'nullable|exists:conversations,id',
            'reason' => 'required|string|in:spam,harassment,inappropriate,fake_profile,other',
            'description' => 'nullable|string|max:1000',
        ]);

        if (auth()->id() === (int) $request->reported_id) {
            return back()->withErrors(['reported_id' => 'You cannot report yourself.']);
        }

        Report::create([
            'reporter_id' => auth()->id(),
            'reported_id' => $request->reported_id,
            'conversation_id' => $request->conversation_id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Thank you. The report has been submitted for review.',
        ]);

        return back();
    }
}
