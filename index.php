<?php
$rootUrl = "https://qdp.hivetasks.com/";
header('Link: <' . $rootUrl . 'css/style.css>; rel=preload; as=style', false);
header('Link: <' . $rootUrl . 'script.js>; rel=preload; as=script', false);
?><!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="/logo.png">
        <link href="<?php echo $rootUrl; ?>strings/en_us.css" rel="stylesheet" />
        <?php
        try {
            $langs = explode(",", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
            $fn = str_replace("-", "_", explode(";", $langs[0])[0]);
            ?><link href="<?php echo $rootUrl; ?>strings/<?php echo strtolower($fn); ?>.css" rel="stylesheet" />
        <?php } catch (Exception $ex) {
            
        }
        ?>
        <link href="<?php echo $rootUrl; ?>css/style.css" rel="stylesheet" />
        <script src="<?php echo $rootUrl; ?>script.js" type="text/javascript" defer></script>
    </head>
    <body<?php
    foreach ($_GET as $key => $value) {
        echo " " . $key . '="' . $value . '"';
    }
    ?>>
        <header>
            <div class="content">
                <a class="☰">☰</a>
                <a id="logo" href="<?php echo $rootUrl; ?>">
                    <img src="<?php echo $rootUrl; ?>logo.png" alt="QDPost" style="position: relative;height: 50px;width: auto;">
                </a>
                <nav class="topmenu">
                    <a class="menu-upload" href="<?php echo $rootUrl; ?>upload"></a>
                </nav>
                <hgroup class="userprofile">
                    <div class="loggedon" class="dropdown">
                        <a  href="<?php echo $rootUrl; ?>"><img src="" alt=""/><span></span></a>
                        <div class="dropdown-content">
                            <a class="loggoff"></a>
                        </div>
                    </div>
                    <a class="loggedoff"></a>
                </hgroup>
            </div>
        </header>
        <div class="row">
            <div class="topics">

            </div>
            <main id="posts_container">
            </main>
        </div>
        <footer>
            <a id="upload-link" href="<?php echo $rootUrl; ?>upload">+</a>
        </footer>
    </body>
</html>
