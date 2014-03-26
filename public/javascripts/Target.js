var Target = function(params) {
    params = params || {};
    this.id = params.id || (new Date()).getTime();
    this.name = params.name || "foo";
    this.position = params.position || new Y.LatLng(0, 0);
    this.radius = params.radius || 0.1;
    this.mapMarkers = [];
};
Target.DEN2_DIE = new Target({
    name : "でんつー大",
    position : new Y.LatLng(35.656410, 139.544058)
});
Target.MS = new Target({
    name : "ゲイツんち",
    position : new Y.LatLng(35.657221, 139.547008)
});
Target.YAHOO = new Target({
    name : "みどどたうん",
    position : new Y.LatLng(35.66572, 139.73100)
});
Target.MARKER_STYLES = {
    fill : new Y.Style("ff0000", null, 0.5),
    stroke : new Y.Style("ffffff", 4, 1)
};

/**
 * エリア位置取得
 * */
Target.prototype.getPosition = function() {
    return this.position;
};

/**
 * エリア位置設定・更新
 * */
Target.prototype.setPosition = function(p) {
    if (p) {
        this.position = p;
        $.event.trigger({
            type : "updateObject",
            object : this
        });
    }
};

/**
 * エリア図示/更新
 * */
Target.prototype.draw = function(ymap) {
    if (this.mapMarkers && this.mapMarkers.length > 0) {
        $.each(this.MapMarkers, function(i, v) {
            ymap.removeFeature(v);
        });
    }
    this.MapMarkers = [];
    var circle = new Y.Circle(this.position, new Y.Size(this.radius, this.radius), {
        unit : "km",
        fillStyle : Target.MARKER_STYLES.fill,
        strokeStyle : Target.MARKER_STYLES.stroke
    });
    this.mapMarkers.push(circle);
    ymap.addFeature(circle);
};
