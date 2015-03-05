var TAGTiled = TAGTiled || {};

/**
 * TMXWriter - TMX file writer for Javascript, compatible with TiledMap.
 * Copyright (c) 2014 James Young
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 30/10/2014
 * @version 0.0.1
 * @author James Young
 *
 * Uses XMLWriter available from:
 * This script and many more are available free online at
 * The JavaScript Source!! http://www.javascriptsource.com
 * Created by: Ariel Flesler | http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.htmlLicensed under: BSD License
 *
 * http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html
 */

TAGTiled.ORIENTATION = {
    UNKNOWN : "unknown",
    ORTHOGONAL : "orthogonal",
    ISOMETRIC : "isometric",
    STAGGERED : "staggered"
};

TAGTiled.RENDER_ORDER = {
    RIGHT_DOWN : "right-down",
    RIGHT_UP   : "right-up",
    LEFT_DOWN  : "left-down",
    LEFT_UP    : "left-up"
};

TAGTiled.LAYERDATAFORMAT = {
        XML        = 0,
        BASE64     = 1,
        BASE64GZIP = 2,
        BASE64ZLIB = 3,
        CSV        = 4
};

TAGTiled.MAP = TAGTiled.MAP | {};

TAGTiled.MAP.orientation = TAGTiled.ORIENTATION.ORTHOGONAL;
TAGTiled.MAP.renderOrder = TAGTiled.RENDER_ORDER.RIGHT_DOWN;
TAGTiled.MAP.width = 0;
TAGTiled.MAP.height = 0;
TAGTiled.MAP.tileWidth = 0;
TAGTiled.MAP.tileHeight = 0;
TAGTiled.MAP.layerDataFormat = TAGTiled.LAYERDATAFORMAT.XML;
TAGTiled.MAP.mapProperties = {};
TAGTiled.MAP.tilesets = {};
TAGTiled.MAP.layers = {};
 
TAGTiled.TMXWriter = function() {
    this.mGidMapper = new GIDMapper();
};
 
TAGTiled.TMXWriter.prototype = {
    writeTMX:function() {
	    var xm = new TAGExt.XMLWriter('UTF-8', '1.0');
		xm.writeStartDocument();
		
		xm.writeStartElement('map');
		xm.writeAttributeString('version', '1.0');
		xm.writeAttributeString('orientation', TAGTiled.MAP.orientation);
		xm.writeAttributeString('renderorder', TAGTiled.MAP.renderOrder);
		xm.writeAttributeString('width', TAGTiled.MAP.width);
		xm.writeAttributeString('height', TAGTiled.MAP.height);
		xm.writeAttributeString('tilewidth', TAGTiled.MAP.tileWidth);
		xm.writeAttributeString('tileheight', TAGTiled.MAP.tileHeight);
		
        writeProperties(xm, TAGTiled.MAP.mapProperties);
					 
		this.mGidMapper.clear();
		var firstGid = 1;
		
		for(var ts in TAGTiled.MAP.tilesets) {
		    this.writeTileset(xm, ts, firstGid);
            this.mGidMapper.insert(firstGid, ts);
            firstGid += ts.tileCount();
        }		

        foreach(var layer in TAGTiled.MAP.layers) {
            var type = layer.layerType();
			
            if(type === TAGTiled.TypeFlag.TileLayerType)
                this.writeTileLayer(xm, layer);
            else if(type === TAGTiled.TypeFlag.ObjectGroupType)
                this.writeObjectGroup(xm, layer);
        }
					 
		xm.writeEndElement(); // map
		
		xm.writeEndDocument();
	},
	
	writeProperties:function(xm, properties){
	    var hasStartElement = false;
		
        for(var p in properties) {
            if(hasStartElement == false) {
                xm.writeStartElement('properties');
				hasStartElement = true;
            }
			
			xm.writeStartElement('property');
			xm.writeAttributeString('name', p);
			xm.writeAttributeString('value', properties[p]);
            xm.writeEndElement(); // property
		}
		
		if(hasStartElement == true) {
            xm.writeEndElement(); // properties
		}
    },
	
	writeTileset:function(xm, tileset, firstGid) {
        xm.writeStartElement("tileset");
		
        if(firstGid > 0) {
            xm.writeAttributeString('firstgid', firstGid);
        }
		
		// TODO: Handle external tileset.
        /*var fileName = tileset.filename();
        if(!(!this.fileName || 0 === this.fileName.length)) {
            blah blah...
            return;
        }*/

        xm.writeAttributeString('name', tileset.name());
        xm.writeAttributeString('tilewidth', tileset.tileWidth());
        xm.writeAttributeString('tileheight', tileset.tileHeight());
    
        var tileSpacing = tileset.tileSpacing();
        var margin = tileset.margin();
        if(tileSpacing != 0) {
            xm.writeAttributeString('spacing', tileSpacing);
		}
        if(margin != 0) {
            xm.writeAttributeString('margin', margin);
        }
		
        var offset = tileset.tileOffset();
        if(!offset.isNull()) {
            xm.writeAttributeString('tileoffset');
            xm.writeAttributeString('x', offset.x());
            xm.writeAttributeString('y', offset.y());
            xm.writeEndElement(); //    tileoffset
        }

        // Write the tileset properties.
        this.writeProperties(xm, tileset.properties());

        // Write the image element
        imageSource = tileset.imageSource();
        if(!(!imageSource || 0 === imageSource.length))
        {
            xm.writeStartElement('image');
            var source = imageSource;
            //if(!mUseAbsolutePaths) {
            //    source = mMapDir.relativeFilePath(source);
			//}
            xm.writeAttributeString('source', source);

			// TODO: support color.
            //var transColor = tileset.transparentColor();
            //if(transColor.isValid()) {
             //   w.writeAttribute(QLatin1String("trans"), transColor.name().mid(1));
			//}

            if(tileset.imageWidth() > 0) {
                xm.writeAttributeString('width', tileset.imageWidth());
			}
            if(tileset.imageHeight() > 0) {
                xm.writeAttributeString('height', tileset.imageHeight());
            }
            xm.writeEndElement(); //image
        }

        // Write the properties for thos tiles that have them.
	    var tiles = tileset.tiles();
        for(var i = 0; i < tiles.length; ++i) {
            var tile = tiles[i];
            var properties = tile.properties();
            var objectGroup = tile.objectGroup();

            if(Object.keys(properties).length > 0 || 
			   (!imageSource || 0 === imageSource.length) || 
			   objectGroup || 
			   tile.isAnimated())
            {
                xm.writeStartElement('tile');
                xm.writeAttributeString('id', i);
				
				// If properties exist, write them.
                if(!properties.isEmpty()) {
                    this.writeProperties(xm, properties);
		        }
				
				// If not image source, specifiy each tile's size
                if(!imageSource || 0 === imageSource.length)
                {
                    xm.writeStartElement('image');

                    tileSize = tile.size();
                    if(!tileSize.isNull())
                    {
                        xm.writeAttributeString('width', tileSize.width());
                        xm.writeAttributeString('height'), tileSize.height());
                    }

                    xm.writeEndElement(); // image
                }
				
				//  object group exists write it
                if(objectGroup) {
                    this.writeObjectGroup(xm, objectGroup);
				}
				
				// If tile is animated then write frame data.
                if(tile.isAnimated())
                {
                    frames = tile.frames();

                    xm.writeStartElement('animation');
                    for(var i; i < frames.length; ++i) {
					    var frame = frames[i];
                        xm.writeStartElement('frame');
                        xm.writeAttributeString('tileid', frame.tileId);
                        xm.writeAttributeString('duration', frame.duration);
                        xm.writeEndElement(); // frame
                    }
                    xm.writeEndElement(); // animations
                }
            
                xm.writeEndElement();
            }
        }

        xm.writeEndElement(); // tileset
	},
	
	writeLayerAttributes : function(xm, layer) {
	    var name = layer.name();
        if(!(!name || 0 === name.length)) {
            xm.writeAttribute('name', name);
		}

        if(layer.layerType() === TAGTiled.TypeFlag.TileLayerType) {
            xm.writeAttributeString('width', layer.width());
            xm.writeAttributeString('height', layer.height());
        }

        var x = layer.x();
        var int y = layer.y();
        var opacity = layer.opacity();
		
        if(x != 0) {
            xm.writeAttributeString('x', x);
		}
        if(y != 0) {
            xm.writeAttributeString('y', y);
		}
		
        if(!layer.isVisible()) {
            xm.writeAttributeString('visible', 0);
		}
        if(opacity !== 1.0) {
            xm.writeAttributeString('opacity', opacity);
		}
    },
	
	writeObjectGroup : function(xm, objectGroup)
    {
        xm.writeStartElement('objectgroup');

        if(objectGroup.color() !== undefined)
        {
            xm.writeAttributeString('color', objectGroup.color().name());
        }

        if(objectGroup.drawOrder() !== TAGUtiles.DrawOrder.TopDownOrder) 
        {
            xm.writeAttributeString('draworder', TAGUtiles.DrawOrder.ToString(objectGroup.drawOrder()));
        }

        this.writeLayerAttributes(xm, objectGroup);
        this.writeProperties(xm, objectGroup.properties());
		
		var objects = objectGroup.objects()l
        for(var i = 0, i < objects.length; ++i) {
            this.writeObject(xm, objects[i]);
        }
        xm.writeEndElement(); // objectgroup
    },
	
	writeObject : function(xm, mapObject) {
        xm.writeStartElement('object');
		
        var name = mapObject.name();
        var type = mapObject.type();
		
        if(!(!name || 0 === name.length)) {
            xm.writeAttributeString('name', name);
		}
        if(!(!type || 0 === type.length)) {
            xm.writeAttributeString('type', type);
		}

        if(!mapObject.cell().isEmpty()) {
            var gid = this.mGidMapper.cellToGid(mapObject.cell());
            xm.writeAttributeString('gid', gid);
        }

        var pos = new TAGGeom.Point(mapObject.x(), mapObject.y());
        var size = new TAGGeom.Point(mapObject.width(), mapObject.height());

        xm.writeAttributeString('x', pos.x());
        xm.writeAttributeString('y', pos.y());

        if(size.x() !== 0) {
            xm.writeAttributeString('width', size.x());
		}
        if(size.y() !== 0) {
            xm.writeAttributeString('height', size.y());
		}

        var rotation = mapObject.rotation();
        if(rotation !== 0.0) {
            xm.writeAttributeString('rotation', rotation);
		}

        if(!mapObject.isVisible()) {
            xm.writeAttributeString('visible', '0');
		}

        this.writeProperties(xm, mapObject.properties());

        var polygon = mapObject.polygon();
        if(!(!polygon || polygon.length === 0))
        {
            if(mapObject.shape() === TAGTiled.MapObject.Polygon)
                xm.writeStartElement('polygon');
            else
                xm.writeStartElement('polyline');

            var points = "";
			for(var i = 0; i < polygon.length; ++ i) {
                var point = polygon[i];
				
                points += point.x();
                points += ',';
                points += point.y();
                points += ' ';
            }
            points = points.substring(0, points.length - 1);
			
            xm.writeAttributeString('points', points);
            xm.writeEndElement(); // polygon/polyline
        }

        if(mapObject->shape() === TAGTiled.MapObject.Ellipse) {
             xm.writeStartElement('ellipse);
            xm.writeEndElement(); // ellipse
		}

        xm.writeEndElement(); // object
    },
	
	writeTileLayer : function(xm, tileLayer) {
		xm.writeStartElement('layer');
		this.writeLayerAttributes(xm, tileLayer);
		this.writeProperties(xm, tileLayer.properties());

		var encoding = undefined;
		var compression = undefined;

		if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.BASE64 || 
		   TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.BASE64GZIP || 
		   TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.BASE64ZLIB)
		{
			encoding = 'base64';

			if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.BASE64GZIP)
				compression = 'gzip';
			else if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.BASE64ZLIB)
				compression = 'zlib';

		}
		else if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.CSV)
			encoding = 'csv';

		xm.writeStartElement('data');
		if(encoding !== undefined)
			xm.writeAttributeString('encoding', encoding);
		if(compression !== undefined)
			xm.writeAttributeString('compression', compression);

		if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.XML)
		{
			for(var y = 0; y < tileLayer.height(); ++y) {
				for(var x = 0; x < tileLayer.width(); ++x) {
					var gid = this.mGidMapper.cellToGid(tileLayer.cellAt(x,y));
					xm.writeStartElement('tile');
					xm.writeAttributeString('gid', gid);
					xm.writeEndElement(); // tile
				}
			}
		}
		else if(TAGTiled.MAP.layerDataFormat === TAGTiled.LAYERDATAFORMAT.CSV)
		{
			var tileData = "";

			for(var y = 0; y < tileLayer.height(); ++y) {
				for(var x = 0; x < tileLayer.width(); ++x) {
					var gid = this.mGidMapper.cellToGid(tileLayer.cellAt(x,y));
					tileData += gid;
					if(x !== tileLayer.width() - 1 || y !== tileLayer.height() - 1)
					{
						tileData += ",";
					}
				}
				tileData += "\n";
			}

			xm.writeString("\n");
			xm.writeString(tileData);
		}
		else
		{
		    throw new Error("TAGTiled.TMXWriter.prototype.writeTileLayer Base64 output Not Implemented!");
			/*QByteArray tileData;
			tileData.reserve(tileLayer->height() * tileLayer->width() * 4);

			for(int y = 0; y < tileLayer->height(); ++y)
			{
				for(int x = 0; x < tileLayer->width(); ++x)
				{
					const unsigned gid = mGidMapper.cellToGid(tileLayer->cellAt(x,y));
					tileData.append((char) (gid));
					tileData.append((char) (gid >> 8));
					tileData.append((char) (gid >> 16));
					tileData.append((char) (gid >> 24));
				}
			}
			
			if(mLayerDataFormat == Map::Base64Gzip)
				tileData = compress(tileData, Gzip);
			else if(mLayerDataFormat == Map::Base64Zlib)
				tileData = compress(tileData, Zlib);

			w.writeCharacters(QLatin1String("\n  "));
			w.writeCharacters(QString::fromLatin1(tileData.toBase64()));
			w.writeCharacters(QLatin1String("\n  "));*/
		}

		w.writeEndElement(); // data
		x.writeEndElement(); // layer
	}
};
