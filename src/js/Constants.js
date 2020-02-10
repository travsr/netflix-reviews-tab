let MetaStream = {};

MetaStream.loggingEnabled = true;

MetaStream.Elements = {};

MetaStream.log = (m) => {
    if(MetaStream.loggingEnabled) {
        let t = new Date();
        console.log(t.getTime() + " [MetaStream] " + m);
    }
};

