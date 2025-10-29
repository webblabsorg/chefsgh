<?php
/**
 * Email Sending API for Ghana Chef Association
 * Compatible with DirectAdmin hosting
 * 
 * This script handles email notifications using PHP's mail() function
 * which works with DirectAdmin's built-in email system
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['to']) || !isset($data['subject']) || !isset($data['html'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: to, subject, html']);
    exit();
}

// Sanitize inputs
$to = filter_var($data['to'], FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars($data['subject'], ENT_QUOTES, 'UTF-8');
$htmlBody = $data['html'];
$from = isset($data['from']) ? filter_var($data['from'], FILTER_SANITIZE_EMAIL) : 'info@chefsghana.com';
$fromName = isset($data['fromName']) ? htmlspecialchars($data['fromName'], ENT_QUOTES, 'UTF-8') : 'Ghana Chef Association';

// Validate email addresses
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid recipient email address']);
    exit();
}

if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid sender email address']);
    exit();
}

// Create plain text version from HTML
$plainText = strip_tags($htmlBody);
$plainText = html_entity_decode($plainText, ENT_QUOTES, 'UTF-8');
$plainText = preg_replace('/\s+/', ' ', $plainText);
$plainText = trim($plainText);

// Generate boundary for multipart email
$boundary = md5(time());

// Email headers
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
$headers[] = "From: {$fromName} <{$from}>";
$headers[] = "Reply-To: {$from}";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "X-Priority: 1"; // High priority for admin notifications
$headers[] = "Importance: High";

// Build email body
$message = "--{$boundary}\r\n";
$message .= "Content-Type: text/plain; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $plainText . "\r\n\r\n";

$message .= "--{$boundary}\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $htmlBody . "\r\n\r\n";

$message .= "--{$boundary}--";

// Send email
try {
    $success = mail($to, $subject, $message, implode("\r\n", $headers));
    
    if ($success) {
        // Log successful email
        error_log("Email sent successfully to: {$to}, Subject: {$subject}");
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Email sent successfully',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        // Log failure
        error_log("Failed to send email to: {$to}, Subject: {$subject}");
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to send email. Please check server mail configuration.'
        ]);
    }
} catch (Exception $e) {
    error_log("Email sending exception: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while sending email: ' . $e->getMessage()
    ]);
}

/**
 * ALTERNATIVE: Using SMTP with PHPMailer (if needed)
 * 
 * Uncomment and configure the following if you need SMTP functionality:
 * 
 * require 'vendor/autoload.php';
 * use PHPMailer\PHPMailer\PHPMailer;
 * use PHPMailer\PHPMailer\Exception;
 * 
 * $mail = new PHPMailer(true);
 * 
 * try {
 *     // SMTP Configuration
 *     $mail->isSMTP();
 *     $mail->Host = 'mail.chefsghana.com';
 *     $mail->SMTPAuth = true;
 *     $mail->Username = 'info@chefsghana.com';
 *     $mail->Password = 'your-email-password';
 *     $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
 *     $mail->Port = 587;
 * 
 *     // Recipients
 *     $mail->setFrom($from, $fromName);
 *     $mail->addAddress($to);
 * 
 *     // Content
 *     $mail->isHTML(true);
 *     $mail->Subject = $subject;
 *     $mail->Body = $htmlBody;
 *     $mail->AltBody = $plainText;
 * 
 *     $mail->send();
 *     echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
 * } catch (Exception $e) {
 *     echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
 * }
 */
?>
