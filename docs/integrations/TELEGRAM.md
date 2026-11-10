# Telegram Bot API Integration

## 1. Overview
The platform connects with Telegram via the official Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/`).

## 2. Bot Setup & Administrator Permissions
To broadcast messages, the Telegram bot must be added to the channel as an Administrator with the following permission:
- `can_post_messages: true`

## 3. Supported Methods
1. **Text Messages:**
   - `POST /sendMessage` with `chat_id`, `text`, `parse_mode=HTML`
2. **Single Photo:**
   - `POST /sendPhoto` with `chat_id`, `photo`, `caption`, `parse_mode=HTML`
3. **Single Video:**
   - `POST /sendVideo` with `chat_id`, `video`, `caption`, `parse_mode=HTML`
4. **Media Albums (Carousels):**
   - `POST /sendMediaGroup` with `chat_id`, `media=[{type: 'photo', media: '...'}, ...]`

## 4. Live Post URL Generation
If the channel has a public username (`@channelname`), direct URL is `https://t.me/channelname/{message_id}`. For private channels, direct link format is `https://t.me/c/{internal_id}/{message_id}`.
