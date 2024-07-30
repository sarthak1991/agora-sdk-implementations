/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

import $protobuf from "protobufjs/minimal"

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.agora = (function() {

    /**
     * Namespace agora.
     * @exports agora
     * @namespace
     */
    var agora = {};

    agora.audio2text = (function() {

        /**
         * Namespace audio2text.
         * @memberof agora
         * @namespace
         */
        var audio2text = {};

        audio2text.Text = (function() {

            /**
             * Properties of a Text.
             * @memberof agora.audio2text
             * @interface IText
             * @property {number|null} [vendor] Text vendor
             * @property {number|null} [version] Text version
             * @property {number|null} [seqnum] Text seqnum
             * @property {number|null} [uid] Text uid
             * @property {number|null} [flag] Text flag
             * @property {number|Long|null} [time] Text time
             * @property {number|null} [lang] Text lang
             * @property {number|null} [starttime] Text starttime
             * @property {number|null} [offtime] Text offtime
             * @property {Array.<agora.audio2text.IWord>|null} [words] Text words
             */

            /**
             * Constructs a new Text.
             * @memberof agora.audio2text
             * @classdesc Represents a Text.
             * @implements IText
             * @constructor
             * @param {agora.audio2text.IText=} [properties] Properties to set
             */
            function Text(properties) {
                this.words = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Text vendor.
             * @member {number} vendor
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.vendor = 0;

            /**
             * Text version.
             * @member {number} version
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.version = 0;

            /**
             * Text seqnum.
             * @member {number} seqnum
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.seqnum = 0;

            /**
             * Text uid.
             * @member {number} uid
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.uid = 0;

            /**
             * Text flag.
             * @member {number} flag
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.flag = 0;

            /**
             * Text time.
             * @member {number|Long} time
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Text lang.
             * @member {number} lang
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.lang = 0;

            /**
             * Text starttime.
             * @member {number} starttime
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.starttime = 0;

            /**
             * Text offtime.
             * @member {number} offtime
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.offtime = 0;

            /**
             * Text words.
             * @member {Array.<agora.audio2text.IWord>} words
             * @memberof agora.audio2text.Text
             * @instance
             */
            Text.prototype.words = $util.emptyArray;

            /**
             * Creates a new Text instance using the specified properties.
             * @function create
             * @memberof agora.audio2text.Text
             * @static
             * @param {agora.audio2text.IText=} [properties] Properties to set
             * @returns {agora.audio2text.Text} Text instance
             */
            Text.create = function create(properties) {
                return new Text(properties);
            };

            /**
             * Encodes the specified Text message. Does not implicitly {@link agora.audio2text.Text.verify|verify} messages.
             * @function encode
             * @memberof agora.audio2text.Text
             * @static
             * @param {agora.audio2text.IText} message Text message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Text.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.vendor != null && Object.hasOwnProperty.call(message, "vendor"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.vendor);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.version);
                if (message.seqnum != null && Object.hasOwnProperty.call(message, "seqnum"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.seqnum);
                if (message.uid != null && Object.hasOwnProperty.call(message, "uid"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.uid);
                if (message.flag != null && Object.hasOwnProperty.call(message, "flag"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.flag);
                if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int64(message.time);
                if (message.lang != null && Object.hasOwnProperty.call(message, "lang"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.lang);
                if (message.starttime != null && Object.hasOwnProperty.call(message, "starttime"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.starttime);
                if (message.offtime != null && Object.hasOwnProperty.call(message, "offtime"))
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.offtime);
                if (message.words != null && message.words.length)
                    for (var i = 0; i < message.words.length; ++i)
                        $root.agora.audio2text.Word.encode(message.words[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Text message, length delimited. Does not implicitly {@link agora.audio2text.Text.verify|verify} messages.
             * @function encodeDelimited
             * @memberof agora.audio2text.Text
             * @static
             * @param {agora.audio2text.IText} message Text message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Text.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Text message from the specified reader or buffer.
             * @function decode
             * @memberof agora.audio2text.Text
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {agora.audio2text.Text} Text
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Text.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agora.audio2text.Text();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.vendor = reader.int32();
                            break;
                        }
                    case 2: {
                            message.version = reader.int32();
                            break;
                        }
                    case 3: {
                            message.seqnum = reader.int32();
                            break;
                        }
                    case 4: {
                            message.uid = reader.int32();
                            break;
                        }
                    case 5: {
                            message.flag = reader.int32();
                            break;
                        }
                    case 6: {
                            message.time = reader.int64();
                            break;
                        }
                    case 7: {
                            message.lang = reader.int32();
                            break;
                        }
                    case 8: {
                            message.starttime = reader.int32();
                            break;
                        }
                    case 9: {
                            message.offtime = reader.int32();
                            break;
                        }
                    case 10: {
                            if (!(message.words && message.words.length))
                                message.words = [];
                            message.words.push($root.agora.audio2text.Word.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Text message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof agora.audio2text.Text
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {agora.audio2text.Text} Text
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Text.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Text message.
             * @function verify
             * @memberof agora.audio2text.Text
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Text.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.vendor != null && message.hasOwnProperty("vendor"))
                    if (!$util.isInteger(message.vendor))
                        return "vendor: integer expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.seqnum != null && message.hasOwnProperty("seqnum"))
                    if (!$util.isInteger(message.seqnum))
                        return "seqnum: integer expected";
                if (message.uid != null && message.hasOwnProperty("uid"))
                    if (!$util.isInteger(message.uid))
                        return "uid: integer expected";
                if (message.flag != null && message.hasOwnProperty("flag"))
                    if (!$util.isInteger(message.flag))
                        return "flag: integer expected";
                if (message.time != null && message.hasOwnProperty("time"))
                    if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                        return "time: integer|Long expected";
                if (message.lang != null && message.hasOwnProperty("lang"))
                    if (!$util.isInteger(message.lang))
                        return "lang: integer expected";
                if (message.starttime != null && message.hasOwnProperty("starttime"))
                    if (!$util.isInteger(message.starttime))
                        return "starttime: integer expected";
                if (message.offtime != null && message.hasOwnProperty("offtime"))
                    if (!$util.isInteger(message.offtime))
                        return "offtime: integer expected";
                if (message.words != null && message.hasOwnProperty("words")) {
                    if (!Array.isArray(message.words))
                        return "words: array expected";
                    for (var i = 0; i < message.words.length; ++i) {
                        var error = $root.agora.audio2text.Word.verify(message.words[i]);
                        if (error)
                            return "words." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Text message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof agora.audio2text.Text
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {agora.audio2text.Text} Text
             */
            Text.fromObject = function fromObject(object) {
                if (object instanceof $root.agora.audio2text.Text)
                    return object;
                var message = new $root.agora.audio2text.Text();
                if (object.vendor != null)
                    message.vendor = object.vendor | 0;
                if (object.version != null)
                    message.version = object.version | 0;
                if (object.seqnum != null)
                    message.seqnum = object.seqnum | 0;
                if (object.uid != null)
                    message.uid = object.uid | 0;
                if (object.flag != null)
                    message.flag = object.flag | 0;
                if (object.time != null)
                    if ($util.Long)
                        (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                    else if (typeof object.time === "string")
                        message.time = parseInt(object.time, 10);
                    else if (typeof object.time === "number")
                        message.time = object.time;
                    else if (typeof object.time === "object")
                        message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
                if (object.lang != null)
                    message.lang = object.lang | 0;
                if (object.starttime != null)
                    message.starttime = object.starttime | 0;
                if (object.offtime != null)
                    message.offtime = object.offtime | 0;
                if (object.words) {
                    if (!Array.isArray(object.words))
                        throw TypeError(".agora.audio2text.Text.words: array expected");
                    message.words = [];
                    for (var i = 0; i < object.words.length; ++i) {
                        if (typeof object.words[i] !== "object")
                            throw TypeError(".agora.audio2text.Text.words: object expected");
                        message.words[i] = $root.agora.audio2text.Word.fromObject(object.words[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Text message. Also converts values to other types if specified.
             * @function toObject
             * @memberof agora.audio2text.Text
             * @static
             * @param {agora.audio2text.Text} message Text
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Text.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.words = [];
                if (options.defaults) {
                    object.vendor = 0;
                    object.version = 0;
                    object.seqnum = 0;
                    object.uid = 0;
                    object.flag = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.time = options.longs === String ? "0" : 0;
                    object.lang = 0;
                    object.starttime = 0;
                    object.offtime = 0;
                }
                if (message.vendor != null && message.hasOwnProperty("vendor"))
                    object.vendor = message.vendor;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.seqnum != null && message.hasOwnProperty("seqnum"))
                    object.seqnum = message.seqnum;
                if (message.uid != null && message.hasOwnProperty("uid"))
                    object.uid = message.uid;
                if (message.flag != null && message.hasOwnProperty("flag"))
                    object.flag = message.flag;
                if (message.time != null && message.hasOwnProperty("time"))
                    if (typeof message.time === "number")
                        object.time = options.longs === String ? String(message.time) : message.time;
                    else
                        object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
                if (message.lang != null && message.hasOwnProperty("lang"))
                    object.lang = message.lang;
                if (message.starttime != null && message.hasOwnProperty("starttime"))
                    object.starttime = message.starttime;
                if (message.offtime != null && message.hasOwnProperty("offtime"))
                    object.offtime = message.offtime;
                if (message.words && message.words.length) {
                    object.words = [];
                    for (var j = 0; j < message.words.length; ++j)
                        object.words[j] = $root.agora.audio2text.Word.toObject(message.words[j], options);
                }
                return object;
            };

            /**
             * Converts this Text to JSON.
             * @function toJSON
             * @memberof agora.audio2text.Text
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Text.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Text
             * @function getTypeUrl
             * @memberof agora.audio2text.Text
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Text.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/agora.audio2text.Text";
            };

            return Text;
        })();

        audio2text.Word = (function() {

            /**
             * Properties of a Word.
             * @memberof agora.audio2text
             * @interface IWord
             * @property {string|null} [text] Word text
             * @property {number|null} [startMs] Word startMs
             * @property {number|null} [durationMs] Word durationMs
             * @property {boolean|null} [isFinal] Word isFinal
             * @property {number|null} [confidence] Word confidence
             */

            /**
             * Constructs a new Word.
             * @memberof agora.audio2text
             * @classdesc Represents a Word.
             * @implements IWord
             * @constructor
             * @param {agora.audio2text.IWord=} [properties] Properties to set
             */
            function Word(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Word text.
             * @member {string} text
             * @memberof agora.audio2text.Word
             * @instance
             */
            Word.prototype.text = "";

            /**
             * Word startMs.
             * @member {number} startMs
             * @memberof agora.audio2text.Word
             * @instance
             */
            Word.prototype.startMs = 0;

            /**
             * Word durationMs.
             * @member {number} durationMs
             * @memberof agora.audio2text.Word
             * @instance
             */
            Word.prototype.durationMs = 0;

            /**
             * Word isFinal.
             * @member {boolean} isFinal
             * @memberof agora.audio2text.Word
             * @instance
             */
            Word.prototype.isFinal = false;

            /**
             * Word confidence.
             * @member {number} confidence
             * @memberof agora.audio2text.Word
             * @instance
             */
            Word.prototype.confidence = 0;

            /**
             * Creates a new Word instance using the specified properties.
             * @function create
             * @memberof agora.audio2text.Word
             * @static
             * @param {agora.audio2text.IWord=} [properties] Properties to set
             * @returns {agora.audio2text.Word} Word instance
             */
            Word.create = function create(properties) {
                return new Word(properties);
            };

            /**
             * Encodes the specified Word message. Does not implicitly {@link agora.audio2text.Word.verify|verify} messages.
             * @function encode
             * @memberof agora.audio2text.Word
             * @static
             * @param {agora.audio2text.IWord} message Word message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Word.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
                if (message.startMs != null && Object.hasOwnProperty.call(message, "startMs"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.startMs);
                if (message.durationMs != null && Object.hasOwnProperty.call(message, "durationMs"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.durationMs);
                if (message.isFinal != null && Object.hasOwnProperty.call(message, "isFinal"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.isFinal);
                if (message.confidence != null && Object.hasOwnProperty.call(message, "confidence"))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.confidence);
                return writer;
            };

            /**
             * Encodes the specified Word message, length delimited. Does not implicitly {@link agora.audio2text.Word.verify|verify} messages.
             * @function encodeDelimited
             * @memberof agora.audio2text.Word
             * @static
             * @param {agora.audio2text.IWord} message Word message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Word.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Word message from the specified reader or buffer.
             * @function decode
             * @memberof agora.audio2text.Word
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {agora.audio2text.Word} Word
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Word.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.agora.audio2text.Word();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.text = reader.string();
                            break;
                        }
                    case 2: {
                            message.startMs = reader.int32();
                            break;
                        }
                    case 3: {
                            message.durationMs = reader.int32();
                            break;
                        }
                    case 4: {
                            message.isFinal = reader.bool();
                            break;
                        }
                    case 5: {
                            message.confidence = reader.double();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Word message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof agora.audio2text.Word
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {agora.audio2text.Word} Word
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Word.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Word message.
             * @function verify
             * @memberof agora.audio2text.Word
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Word.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.text != null && message.hasOwnProperty("text"))
                    if (!$util.isString(message.text))
                        return "text: string expected";
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    if (!$util.isInteger(message.startMs))
                        return "startMs: integer expected";
                if (message.durationMs != null && message.hasOwnProperty("durationMs"))
                    if (!$util.isInteger(message.durationMs))
                        return "durationMs: integer expected";
                if (message.isFinal != null && message.hasOwnProperty("isFinal"))
                    if (typeof message.isFinal !== "boolean")
                        return "isFinal: boolean expected";
                if (message.confidence != null && message.hasOwnProperty("confidence"))
                    if (typeof message.confidence !== "number")
                        return "confidence: number expected";
                return null;
            };

            /**
             * Creates a Word message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof agora.audio2text.Word
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {agora.audio2text.Word} Word
             */
            Word.fromObject = function fromObject(object) {
                if (object instanceof $root.agora.audio2text.Word)
                    return object;
                var message = new $root.agora.audio2text.Word();
                if (object.text != null)
                    message.text = String(object.text);
                if (object.startMs != null)
                    message.startMs = object.startMs | 0;
                if (object.durationMs != null)
                    message.durationMs = object.durationMs | 0;
                if (object.isFinal != null)
                    message.isFinal = Boolean(object.isFinal);
                if (object.confidence != null)
                    message.confidence = Number(object.confidence);
                return message;
            };

            /**
             * Creates a plain object from a Word message. Also converts values to other types if specified.
             * @function toObject
             * @memberof agora.audio2text.Word
             * @static
             * @param {agora.audio2text.Word} message Word
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Word.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.text = "";
                    object.startMs = 0;
                    object.durationMs = 0;
                    object.isFinal = false;
                    object.confidence = 0;
                }
                if (message.text != null && message.hasOwnProperty("text"))
                    object.text = message.text;
                if (message.startMs != null && message.hasOwnProperty("startMs"))
                    object.startMs = message.startMs;
                if (message.durationMs != null && message.hasOwnProperty("durationMs"))
                    object.durationMs = message.durationMs;
                if (message.isFinal != null && message.hasOwnProperty("isFinal"))
                    object.isFinal = message.isFinal;
                if (message.confidence != null && message.hasOwnProperty("confidence"))
                    object.confidence = options.json && !isFinite(message.confidence) ? String(message.confidence) : message.confidence;
                return object;
            };

            /**
             * Converts this Word to JSON.
             * @function toJSON
             * @memberof agora.audio2text.Word
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Word.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Word
             * @function getTypeUrl
             * @memberof agora.audio2text.Word
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Word.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/agora.audio2text.Word";
            };

            return Word;
        })();

        return audio2text;
    })();

    return agora;
})();

// module.exports = $root;

export default $root