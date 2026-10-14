import { QRCode } from '../models/qrCode';

export const qrGenerator = async (qrCode: QRCode) => {
  const value = getQrValue(qrCode);

  const options = {
    width: 300,
    height: 300,
    data: 'https://www.facebook.com/',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    dotsOptions: {
      color: '#4267b2',
      type: 'rounded',
    },
    backgroundOptions: {
      color: '#e9ebee',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 20,
    },
  };
};

const getQrValue = (qrCode: QRCode) => {
  switch (qrCode.type) {
    case 'Wifi': {
      const { ssid, password, encryption, hidden } = qrCode.data;
      return `WIFI:S:${ssid};T:${encryption || ''};P:${password || ''};H:${
        hidden ? 'true' : ''
      };;`;
    }
    case 'URL': {
      const { short_url } = qrCode.data;
      return short_url;
    }
    case 'Text': {
      const { text } = qrCode.data;
      return text;
    }
    case 'PDF': {
      const { short_url } = qrCode.data;
      return short_url;
    }
    case 'Event': {
      const { event_title, start_time, end_time } = qrCode.data;
      return `BEGIN:VEVENT\nSUMMARY:${event_title}\nDTSTART:${start_time}\nDTEND:${end_time}\nEND:VEVENT`;
    }
    default:
      return '';
  }
};
