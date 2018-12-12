const _translate = require('@vitalets/google-translate-api');

class translate {

  constructor(_app) {
    this.app = _app;
    this.rest = this.rest.bind(this);
  }

  rest() {
    if (!this.app) return;
    this.app.post('/api/translate',  (req, res)=> {
      let text = req.body.text;
      let opts = req.body.options;
      _translate(text, opts).then(_res => {
        res.json(_res);
      }).catch(err => {
        console.error(err);
        res.json(err);
      });
    });

    this.app.get('/api/translate',  (req, res)=> {
      let text = req.query['text'];
      let opts = {
        from: req.query['from'],
        to: req.query['to'],
        raw: req.query['raw']
      };
      _translate(text, opts).then(_res => {
        res.json(_res);
      }).catch(err => {
        console.error(err);
        res.json(err);
      });
    });
  }


}

module.exports.translate = translate;