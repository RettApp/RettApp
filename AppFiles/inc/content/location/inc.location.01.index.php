<div data-role="page" id="location-01-index">
	<div data-role="header" data-position="fixed">
		<div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-left">
			<a href="#function-99-navigationpanel" class="ui-btn ui-btn-icon-right ui-icon-bars ui-btn-icon-notext">Menü</a>
			<a data-rel="back" class="ui-btn ui-btn-icon-right ui-icon-arrow-l ui-btn-icon-notext">Zurück</a>
		</div>
		<h1>Standort</h1>
		<div data-role="controlgroup" data-type="horizontal" class="ui-mini ui-btn-right">
			<a href="#function-02-settings" class="ui-btn ui-btn-icon-right ui-icon-gear ui-btn-icon-notext" data-transition="slidefade" data-direction="reverse">Einstellungen</a>
			<a href="#main-02-index" class="ui-btn ui-btn-icon-right ui-icon-home ui-btn-icon-notext">Home</a>
		</div>
	</div>
	<div data-role="content" role="main" class="ui-content">
		<div id="location-01-index-map_canvas">
		</div>
		<div id="location-01-map_canvas_info">
			<p>Klicken Sie auf die Karte für mehr Informationen</p>
		</div>
		<p id="location-01-map_canvas_stoplocation">
			<input type="checkbox" name="checkbox-1a" id="stoplocation" checked="">
			<label for="stoplocation">Karte zentrieren</label>
		</p>
	</div>
</div>