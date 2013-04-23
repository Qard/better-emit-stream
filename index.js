var through = require('through')
  , events = require('events')

// Senders
exports.toSender = function (ev) {
  return (typeof ev.pipe === 'function')
    ? exports.fromSenderStream(ev)
    : exports.toSenderStream(ev)
}

exports.toSenderStream = function (ev) {
  var s = through(function write (args) {
    this.emit('data', args)
  }, function end () {
    var ix = ev._sendStreams.indexOf(s)
    ev._sendStreams.splice(ix, 1)
  });
  
  if ( ! ev._sendStreams) {
    ev._sendStreams = []
    
    var emit = ev.emit
    ev.emit = function () {
      if (s.writable) {
        var args = [].slice.call(arguments)
        ev._sendStreams.forEach(function (es) {
          es.write(args)
        })
      }
      emit.apply(ev, arguments)
    }
  }
  ev._sendStreams.push(s)
  
  return s
}

exports.fromSenderStream = function (s) {
  var ev = new events.EventEmitter
  ev.emit = function () {
    s.write.call(s, arguments)
  }
  return ev
}

// Receivers
exports.toReceiver = function (ev) {
  return (typeof ev.pipe === 'function')
    ? exports.fromReceiverStream(ev)
    : exports.toReceiverStream(ev)
}

exports.toReceiverStream = function (ev) {
  var s = through(function write (args) {
    this.emit('data', args)
  }, function end () {
    var ix = ev._receiveStreams.indexOf(s)
    ev._receiveStreams.splice(ix, 1)
  })
  
  ev._receiveStreams || (ev._receiveStreams = [])
  ev._receiveStreams.push(s)

  s.on('data', function (args) {
    ev.emit.apply(ev, args)
  })
  
  return s
}

exports.fromReceiverStream = function (s) {
  var ev = new events.EventEmitter
  s.pipe(through(function (args) {
    ev.emit.apply(ev, args)
  }))
  return ev
}