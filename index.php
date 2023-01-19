<?php
   $rootUrl = "https://qdp.hivetasks.com/";
   header('Link: <' . $rootUrl . 'style.css>; rel=preload; as=style', false);
   header('Link: <' . $rootUrl . 'script.js>; rel=preload; as=script', false);
?><!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link href="<?php echo $rootUrl;?>style.css" rel="stylesheet" />
        <script src="<?php echo $rootUrl;?>script.js" type="text/javascript" defer></script>
    </head>
    <body<?php
        foreach ($_GET as $key => $value) {
            echo " " .$key . '="' . $value . '"';
        }
    ?>>
        <header>
            <hgroup class="sitename">
                <a class="☰">☰</a>
                <a href="<?php echo $rootUrl;?>">QDPost</a>
            </hgroup>
            <nav class="topmenu">
                <a href="<?php echo $rootUrl;?>upload">Upload</a>
            </nav>
            <hgroup class="userprofile">
                <a class="loggedon" href="<?php echo $rootUrl;?>"><img src="" alt=""/><span></span></a>
                <a class="loggedoff">Login</a>
            </hgroup>
        </header>
        <aside class="left"></aside>
        <main id="posts_container">
            
        </main>
        <aside class="right"></aside>
        <footer>
            
        </footer>
    </body>
</html>
