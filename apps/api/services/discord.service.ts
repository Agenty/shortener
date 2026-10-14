export const postToDiscord = async (message: string, data: string) => {
  const req = new Request(
    'https://discord.com/api/webhooks/1186626088391147600/NBQujGZ2WBbsgmGv2xlerSDAlxIFMUUaOIMubbC9O97adz2_mPl-wDuQdwa9BywnHO0E',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        content: message.substring(0, 120),
        tts: true,
        embeds: [
          {
            type: 'rich',
            title: message,
            description: data.substring(0, 1024),
            color: 0x21e0fd,
            url: `https://idm.in/`,
          },
        ],
      }),
    }
  );

  const resp = await fetch(req);
  return await resp.text();
};
