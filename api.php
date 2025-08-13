<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = 'data.json';
$maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Initialize data file if it doesn't exist
if (!file_exists($dataFile)) {
    $initialData = [
        'reports' => [],
        'lastUpdated' => date('c'),
        'metadata' => [
            'version' => '1.0',
            'totalReports' => 0,
            'activeReports' => 0
        ]
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

function loadData() {
    global $dataFile;
    $content = file_get_contents($dataFile);
    return json_decode($content, true);
}

function saveData($data) {
    global $dataFile;
    $data['lastUpdated'] = date('c');
    return file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
}

function cleanExpiredReports($reports) {
    global $maxAge;
    $now = time() * 1000; // Current time in milliseconds
    
    return array_filter($reports, function($report) use ($now, $maxAge) {
        if (!isset($report['timestamp'])) return false;
        $reportTime = strtotime($report['timestamp']) * 1000;
        return ($now - $reportTime) < $maxAge;
    });
}

// Handle different request methods
switch ($_SERVER['REQUEST_METHOD']) {
    
    case 'GET':
        // Return all active reports
        $data = loadData();
        $data['reports'] = cleanExpiredReports($data['reports']);
        $data['metadata']['activeReports'] = count($data['reports']);
        
        // Save cleaned data back
        saveData($data);
        
        echo json_encode([
            'success' => true,
            'reports' => array_values($data['reports']), // Reindex array
            'metadata' => $data['metadata'],
            'lastUpdated' => $data['lastUpdated']
        ]);
        break;
        
    case 'POST':
        // Add new report
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['report'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid report data']);
            exit;
        }
        
        $report = $input['report'];
        
        // Validate required fields
        $required = ['id', 'type', 'severity', 'description', 'lat', 'lng', 'timestamp'];
        foreach ($required as $field) {
            if (!isset($report[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
                exit;
            }
        }
        
        // Load existing data
        $data = loadData();
        
        // Clean expired reports
        $data['reports'] = cleanExpiredReports($data['reports']);
        
        // Check for duplicate (same ID)
        $exists = false;
        foreach ($data['reports'] as $existingReport) {
            if ($existingReport['id'] == $report['id']) {
                $exists = true;
                break;
            }
        }
        
        if ($exists) {
            echo json_encode(['success' => false, 'error' => 'Report with this ID already exists']);
            exit;
        }
        
        // Add new report
        $data['reports'][] = $report;
        $data['metadata']['totalReports']++;
        $data['metadata']['activeReports'] = count($data['reports']);
        
        // Save data
        if (saveData($data)) {
            echo json_encode([
                'success' => true,
                'message' => 'Report added successfully',
                'reportId' => $report['id'],
                'totalReports' => count($data['reports'])
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save report']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?>
