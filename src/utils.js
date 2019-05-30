define( [], function () {
    function _getRefs(data, refName,t) {
      var ref = data;
      var name = refName;
      var props = refName.split('.');
      if(props.length > 0) {
        for(var i = 0; i < props.length - 1; ++i) {
          if(ref[props[i]])
            ref = ref[props[i]];
        }
        name = props[props.length - 1];
      }
      if(t=='ref')
          return ref;
      else
          return name;
    }
   
    function setRefValue(data, refName, value) {
      var ref = _getRefs(data, refName,'ref');
      var name = _getRefs(data, refName,'name');
       
      ref[name] = value;
    }
   
    function getRefValue(data, refName) {
      var ref = _getRefs(data, refName,'ref');
      var name = _getRefs(data, refName,'name');
       
      return ref[name];
    }
     
    function createCookie(name,value,days) {
      var expires ='';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
   
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
   
    function eraseCookie(name) {
        createCookie(name,"",-1);
    }
   
    //JavaScript bitwise XOR operator
    function jsEncode(s, k) {
        var enc = "";
        var str = "";
        // make sure that input is string
        str = s.toString();
        for (var i = 0; i < s.length; i++) {
          // create block
          var a = s.charCodeAt(i);
          // bitwise XOR
          var b = a ^ k;
          enc = enc + String.fromCharCode(b);
        }
        return enc;
      }
   
    return {
      setRefValue     : setRefValue,
      getRefValue     : getRefValue,
      createCookie    : createCookie,
      readCookie      : readCookie,
      eraseCookie     : eraseCookie,
      jsEncode        : jsEncode
    };
     
     
     
   });    