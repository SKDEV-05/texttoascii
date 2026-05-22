<?php

namespace App\Http\Controllers;

use App\Models\TalentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TalentController extends Controller
{
    public function show(TalentProfile $talent): Response
    {
        return Inertia::render('talents/show', [
            'talent' => $talent->load('user'),
            'canSeeContactInfo' => auth()->user()->canSeeContactInfo(),
        ]);
    }
}
