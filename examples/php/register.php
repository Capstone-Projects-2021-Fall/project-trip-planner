<?php
// database connection code
// $con = mysqli_connect('localhost', 'database_user', 'database_password','database');
// get the post records



$db_host = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com';
$db_user = 'admin';
$db_password = 'TripPlanner';
$db_name = 'TripPlanner';


$conn = mysqli_connect($db_host, $db_user, $db_password, $db_name);
if(!$conn){
    die('Could not Connect to MySQL:' .$conn->connect_error);
    }


$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$email = $_POST['email'];
$password = $_POST['password'];
$number = $_POST['number'];

$sql = "INSERT INTO 'registration'('firstName', 'lastName', 'email', 'password', 'number') VALUES('$firstName', '$lastName', '$email, '$password', '$number')";

$rs = mysqli_query($conn, $sql);

if($rs) {
    echo "Registration Complete!";
}


?>
//
// require_once "config.php";
// require_once "session.php";
//
// if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['submit'])) {
//     $fullname = trim($_POST['name']);
//     $email = trim($_POST['email']);
//     $password = trim($_POST['password']);
//     $confirm_password = trim($_POST["confirm_password"]);
//     $password_hash = password_hash($password, PASSWORD_BCRYPT);
//
//     if($query = $db->prepare("SELECT * FROM users WHERE email = ?")) {
//         $error = '';
//
//     //Bind parameters (s = string, i - int, b - blob, etc) in this case, username is string so we use "s"
//     $query->bind_param('s', $email);
//     $query->execute();
//     //store the result so we can check if the account exists in the db
//     $query->store_result();
//         if ($query->num_rows > 0) {
//         $error .= '<p class="error">This email is already registered!</p>';
//         } else {
//         //validate pw
//             if (strlen($password) < 6) {
//                 $error .= '<p class="error">Password must have at least 6 characters.</p>';
//             }
//
//             if(empty($confirm_password) {
//                 $error .= '<p class="error">Please confirm password.</p>';
//             } else {
//                 if (empty($error) && ($password != $confirm_password)) {
//                     $error .= '<p class="error">Password does not match.</p>';
//                 }
//             }
//             if (empty($error)) {
//                 $insertQuery = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?);");
//                 $insertQuery->bind_param("sss", $fullname, $email, $password_hash);
//                 $result = $insertQuery->execute();
//                 if ($result) {
//                     $error .= '<p class="success">Your registration was successful!</p>';
//                 } else {
//                     $error .= '<p class="error">Something went wrong!</p>';
//                 }
//             }
//         }
//     }
//     $query->close();
//     $insertQuery->close();
//     //close db connection
//     mysqli_close($db);
// }
?>

