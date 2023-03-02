<?php
$rootUrl = "https://qdp.hivetasks.com/";
$v = date('Ymdh');
header('Link: <' . $rootUrl . 'css/style.css?' . $v . '>; rel=preload; as=style', false);
header('Link: <' . $rootUrl . 'script.js?' . $v . '>; rel=preload; as=script', false);
?><!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/png" href="/logo.png">
        <?php
        try {
            $langs = explode(",", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
            foreach ($langs as $i => $lang) {
                $fn = str_replace("-", "_", explode(";", $lang)[0]);
                ?><link href="<?php echo $rootUrl; ?>strings/<?php echo strtolower($fn); ?>.css" rel="stylesheet" <?php echo $langs[0] != $lang ? "disabled" : ""; ?> />
                <?php
            }
        } catch (Exception $ex) {
            
        }
        ?>
        <link href="<?php echo $rootUrl; ?>css/style.css?<?= $v ?>" rel="stylesheet" />
        <script src="<?php echo $rootUrl; ?>script.js?<?= $v ?>" type="text/javascript" defer></script>
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
                    <a class="loggedon" href="<?php echo $rootUrl; ?>"><img src="" alt=""/><span></span></a>
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
