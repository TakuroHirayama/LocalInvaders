var Player = function(params) {
    params = params || {};
    this.id = params.id || (new Date()).getTime();
    this.name = params.name || "電通すけべ太郎";
    this.icon = params.icon || "";
    this.position = params.position || Player.SUKEBE.position;
    this.positionAccuracy = params.accuracy || 0;
    this.mapMarkers = [];
};
Player.SUKEBE = new Player({
    name : "電通すけべ太郎",
    position : new Y.LatLng(35.656410, 139.544058)
});
Player.GEITSU = new Player({
    name : "げいつ太郎",
    position : new Y.LatLng(35.657221, 139.547008)
});

/**
 * プレイヤー位置設定・更新
 * */
Player.prototype.setPosition = function(p) {
    if (!p) {
        return;
    }
    if (!( p instanceof Y.LatLng)) {
        var latitude = p.latitude || p.Latitude || p.lat || p.Lat;
        var longitude = p.longitude || p.Longitude || p.lon || p.Lon || p.lng || p.Lng;
        if (!latitude || !longitude) {
            return this;
        }
        p = new Y.LatLng(latitude, longitude);
    }
    this.position = p;
    $.event.trigger({
        type : "updateObject",
        object : this
    });
    return this;
};

/**
 * プレイヤー位置精度設定・更新[m]
 * */
Player.prototype.setPositionAccuracy = function(acc) {
    if (! typeof acc === "number" || !acc || !acc.accuracy) {
        return;
    }
    this.positionAccuracy = acc || acc.accuracy;
    return this;
};

/**
 * プレイヤー位置取得
 * */
Player.prototype.getPosition = function() {
    return this.position;
};

/**
 * プレイヤー位置精度取得
 * */
Player.prototype.getPositionAccuracy = function() {
    return this.positionAccuracy;
};

Player.MARKER_STYLES = {
    fill : new Y.Style("0000ff", null, 0.5),
    stroke : new Y.Style("ffffff", 4, 1)
};

Player.ERROR_MIN = 5;

/**
 * プレイヤー図示/更新
 * */
Player.prototype.draw = function(ymap) {
    if (this.mapMarkers && this.mapMarkers.length > 0) {
        $.each(this.mapMarkers, function(i, v) {
            ymap.removeFeature(v);
        });
    }
    this.mapMarkers = [];
    if (this.icon) {
        var icon = new Y.Icon(this.icon);
        var marker = new Y.Marker(this.position, {
            icon : icon
        });
    } else {
        var marker = new Y.Label(this.position, this.name);
    }
    marker.bind("click",this.onClick);
    this.mapMarkers.push(marker);
    ymap.addFeature(marker);
    if (this.positionAccuracy > Player.ERROR_MIN) {
        var circle = new Y.Circle(this.position, new Y.Size(this.positionAccuracy, this.positionAccuracy), {
            unit : "km",
            fillStyle : Player.MARKER_STYLES.fill,
            strokeStyle : Player.MARKER_STYLES.stroke
        });
        this.mapMarkers.push(circle);
        ymap.addFeature(circle);
    }
};

Player.prototype.onClick = function() {
    var position = this.getLatLng();
    position.Lon += 0.001;
    this.setLatLng(position);
};
