<?php
  $v = 11;
?>
<!DOCTYPE html>
<html>
    <head>
      <title>Web Audio Tool</title>
      
      <script src="js/lib/require.js"></script>
      
      <?php
        echo '<link rel="stylesheet" type="text/css" href="css/style.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/code.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/header.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/drawarea.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/footer.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/overlay.css?v=' . $v . "\">\n";
        echo '<link rel="stylesheet" type="text/css" href="css/buffer.css?v=' . $v . "\">\n";
      ?>

      <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-58928223-1', 'auto');
        ga('send', 'pageview');


      </script>
    </head>
    <body class="noselect">
      <div class="siteheader">
        <h1>Web Audio Tool <small>v0.1</small></h1>
        <ul class="menu"></ul>
      </div>
    	<div class="draw-area">
        <canvas></canvas>
      </div>
      <div id="overlay"></div>
      <div id="footer">
        <ul class="options">
          <li><a href="https://twitter.com/webaudiotool" class="twitter" target="_blank">twitter</a></li>
          <li><a href="#" class="help">help</a></li>
          <li><a href="#" class="to_code">generate code</a></li>
          <li><a href="#" class="share">share</a></li>
        </ul>
        <div class="breadcrumb"></div>
        <div class="livecode"></div>
      </div>
      <div id="bufferlist">
        <div class="header">
          <h2>Audio buffers</h2><a class="new" href="#">add new</a>
        </div>
        <ul class="list"></ul>
      </div>
      <input type="file" style="display:none" accept=".pw">
    </body>
    <script>
        require(["js/app.js?v=<?php echo $v ?>"]);
      </script>
</html>