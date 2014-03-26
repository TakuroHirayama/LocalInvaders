var Map = function(params) {
    params = params || {};
    this.objects = params.objects || [];
    this.ymap = new Y.Map(params.map_container || "map", {
        configure : {
            doubleClickZoom : true,
            scrollWheelZoom : true,
            singleClickPan : true,
            dragging : true,
            hybridPhoto : true,
            enableFlickScroll : true
        }
    });
    this.view_self = false;
    this.zoom = 17;
    this.initControls();
    $(document).on("updateObject", this.update.bind(this));
    //TODO:効いてない、というかそもそも要らない
    $(window).on("resize", function() {
        this.ymap.updateSize();
    }.bind(this));
};

Map.prototype.initControls = function() {
    var control = new Y.LayerSetControl();
    this.ymap.addControl(control);
    control = new Y.ScaleControl();
    this.ymap.addControl(control);
    control = new Y.SliderZoomControlHorizontal();
    this.ymap.addControl(control);
};

/**
 * 地図上に何かをセット
 * */
Map.prototype.addObjects = function(objectList) {
    var self = this;
    if (objectList && objectList.length > 0) {
        $.each(objectList, function(i, v) {
            self.addObject(v);
        });
    }
};

/**
 * 地図上に何かを追加
 * */
Map.prototype.addObject = function(object) {
    if (object) {
        this.objects.push(object);
        $.event.trigger({
            type : "updateObject",
            object : object
        });
    }
};

/**
 * 地図上の何かを除去
 * */
Map.prototype.removeObject = function(object) {
    var self = this;
    $.each(this.objects, function(i, v) {
        if (v.isTarget && v.isTarget()) {
            self.objects.splice(i, 1);
            if (object && object.remove) {
                object.remove(self.ymap);
            }
        }
    });
};

/**
 * 地図表示
 * */
Map.prototype.drawMap = function(center) {
    if (this.view_self || center) {
        this.ymap.drawMap(center, this.ymap.getZoom(), Y.LayerSetId.NORMAL);
        return;
    }
    try {
        var bounds = this.getBounds();
        this.ymap.drawBounds(new Y.LatLngBounds(bounds.min, bounds.max), Y.LayerSetId.NORMAL);
    } catch(e) {
        console.error(e);
        this.ymap.drawMap(Target.DEN2_DIE.position, 17, Y.LayerSetId.NORMAL);
    }
};

/**
 * マーカー図示/更新
 * */
Map.prototype.drawObjects = function() {
    if (!this.objects) {
        throw new Error("No Objects");
    }
    this.objects.forEach( function(o, i) {
        o.draw(this.ymap);
    }.bind(this));
};

/**
 * 地図と地図上の何かを描画
 * */
Map.prototype.draw = function(center) {
    this.drawMap(center);
    this.drawObjects();
};

/**
 * 地図上の何かの状態を更新
 * */
Map.prototype.update = function(event) {
    if (event.object && typeof event.object.draw === "function" && $.inArray(event.object, this.objects) > -1) {
        event.object.draw(this.ymap);
        this.drawMap();
    }

};

/**
 * プレイヤーとエリアの位置から最適な地図表示範囲を計算
 * */
Map.prototype.getBounds = function() {
    if (!this.objects || !this.objects.length) {
        throw new Error("No Objects");
    }

    var max = {
        Lat : -90,
        Lon : -180
    };
    var min = {
        Lat : 90,
        Lon : 180
    };
    this.objects.forEach(function(p, i) {
        position = p.position;
        if (max.Lat <= position.Lat) {
            max.Lat = position.Lat;
        }
        if (min.Lat >= position.Lat) {
            min.Lat = position.Lat;
        }
        if (max.Lon <= position.Lon) {
            max.Lon = position.Lon;
        }
        if (min.Lon >= position.Lon) {
            min.Lon = position.Lon;
        }
    });
    return {
        max : new Y.LatLng(max.Lat, max.Lon),
        min : new Y.LatLng(min.Lat, min.Lon)
    };
};
