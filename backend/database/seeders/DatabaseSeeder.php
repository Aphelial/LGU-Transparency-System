<?php
 
namespace Database\Seeders;
 
use App\Models\{Announcement, Budget, Project, User};
use Illuminate\Database\Seeder;
 
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@gmail.com')->first()
            ?? User::where('email', 'admin@lgu.test')->first()
            ?? new User();
        $admin->fill([
            'name' => 'Municipal Admin',
            'email' => 'admin@gmail.com',
            'password' => 'admin123',
            'role' => 'admin',
        ])->save();
 
        $totals = ['Infrastructure' => 25_000_000, 'Health' => 8_000_000, 'Disaster relief' => 6_000_000, 'Education' => 10_000_000];
        $titles = [
            'Infrastructure' => ['Barangay Road Concreting', 'Drainage System Upgrade', 'Public Market Rehabilitation'],
            'Health' => ['Rural Health Unit Expansion', 'Mobile Clinic Procurement', 'Dengue Prevention Drive'],
            'Disaster relief' => ['Evacuation Center Repair', 'Early Warning System Installation', 'Relief Goods Warehouse'],
            'Education' => ['School Classroom Construction', 'Library & Learning Hub', 'Scholarship Fund Program'],
        ];
        $items = [
            'Infrastructure' => ['Portland cement (bags)', 'Steel bars 12mm', 'Gravel (cu.m)', 'Hollow blocks', 'Plywood sheets'],
            'Health' => ['Medical supplies kit', 'Vaccines (vials)', 'Hospital beds', 'Medicines', 'Lab equipment'],
            'Disaster relief' => ['Rice sacks (25kg)', 'Canned goods (box)', 'Tarpaulins', 'Radio units', 'Hygiene kits'],
            'Education' => ['Armchairs', 'Whiteboards', 'Books (set)', 'Laptops', 'Roofing sheets'],
        ];
        $contractors = ['Mabuhay Builders Corp.', 'Pinagbuhatan Construction', 'Santos & Reyes Engineering', 'BayanTech Contractors', 'Dela Cruz Trading'];
        $places = ['Brgy. San Isidro', 'Brgy. Poblacion', 'Brgy. Sta. Lucia', 'Brgy. Bagong Silang', 'Brgy. Maligaya'];
        $statuses = ['Planned', 'Ongoing', 'Completed', 'Delayed'];
        $fraction = ['Planned' => 0, 'Ongoing' => 0.55, 'Completed' => 0.95, 'Delayed' => 0.4];
        $n = 0;
 
        foreach ([2025, 2026] as $year) {
            foreach ($totals as $cat => $amount) {
                $budget = Budget::create(['fiscal_year' => $year, 'category' => $cat, 'amount_allocated' => $amount]);
                $list = array_slice($titles[$cat], 0, $year === 2025 ? 2 : 3);
 
                foreach ($list as $title) {
                    $status = $year === 2025 ? ['Completed', 'Completed', 'Delayed'][$n % 3] : $statuses[$n % 4];
                    $alloc = round($amount * 0.28, 2);
                    $start = now()->setYear($year)->startOfYear()->addDays(20 + $n * 9);
                    $target = (clone $start)->addDays(150);
 
                    $p = Project::create([
                        'budget_id' => $budget->id, 'title' => $title.' – '.$places[$n % 5], 'category' => $cat,
                        'description' => "$title for the benefit of residents, funded under the $year $cat budget.",
                        'amount_allocated' => $alloc, 'contractor' => $contractors[$n % 5], 'location' => $places[$n % 5].', Municipality',
                        'status' => $status,
                        'progress_notes' => match ($status) {
                            'Planned' => 'Awaiting bidding and notice to proceed.',
                            'Ongoing' => 'Work is on schedule. Site inspection completed this month.',
                            'Completed' => 'Project turned over and accepted by the barangay.',
                            'Delayed' => 'Delayed due to weather and late material delivery.',
                        },
                        'start_date' => $start->toDateString(), 'target_end_date' => $target->toDateString(),
                        'actual_end_date' => $status === 'Completed' ? (clone $target)->subDays(rand(1, 20))->toDateString() : null,
                    ]);
 
                    if ($fraction[$status] > 0) {
                        for ($i = 0; $i < 3; $i++) {
                            $qty = rand(10, 200);
                            $unit = round($alloc * $fraction[$status] / 3 / $qty, 2);
                            $p->expenses()->create([
                                'item_name' => $items[$cat][($n + $i) % 5], 'quantity' => $qty, 'unit_cost' => $unit,
                                'total_cost' => round($qty * $unit, 2), 'date_purchased' => (clone $start)->addDays(10 + $i * 20)->toDateString(),
                            ]);
                        }
                    }
                    $n++;
                }
            }
        }
 
        $ann = [
            ['Relief', 'Typhoon Relief Goods Distribution', 'Families affected by the recent typhoon will receive rice, canned goods, and hygiene kits at the covered court.', 850],
            ['Program', 'Free Annual Medical Mission', 'Free check-ups, dental services, and medicines for all residents.', 600],
            ['Event', 'Municipal Town Hall Meeting', 'Join the mayor and department heads to review the 2026 budget and ongoing projects.', 300],
            ['Program', 'Scholarship Applications Open', 'Qualified students may apply for the municipal scholarship program until the end of the month.', 120],
            ['Relief', 'Flood Victims Cash Assistance', 'Cash assistance for households affected by flooding. Bring a valid ID.', 430],
            ['Event', 'Clean-Up Drive and Tree Planting', 'Volunteers are invited to help clean the riverbanks and plant native trees.', 250],
            ['Program', 'Livelihood Training Series', 'Free skills training on food processing, welding, and basic bookkeeping.', 180],
            ['Event', 'Public Hearing on Drainage Projects', 'Residents may share feedback on the proposed drainage upgrades.', 150],
            ['Relief', 'Evacuation Center Food Packs', 'Food packs distributed to residents staying in evacuation centers.', 320],
            ['Program', 'Senior Citizens Pension Payout', 'Quarterly pension payout schedule per barangay.', 540],
            ['Event', 'Barangay Health Fair', 'Blood pressure checks, nutrition talks, and immunization.', 400],
            ['Relief', 'School Supplies for Affected Students', 'School kits for students from families affected by disasters.', 275],
        ];
        foreach ($ann as $i => [$cat, $title, $desc, $count]) {
            Announcement::create([
                'title' => $title, 'description' => $desc, 'category' => $cat, 'beneficiaries_count' => $count,
                'date' => now()->subDays($i * 6)->toDateString(), 'venue' => ['Municipal Covered Court', 'Municipal Hall', 'Brgy. Poblacion Gym'][$i % 3],
            ]);
        }
    }
}
