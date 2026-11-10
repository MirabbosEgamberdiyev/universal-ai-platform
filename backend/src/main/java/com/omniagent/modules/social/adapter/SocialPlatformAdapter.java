package com.omniagent.modules.social.adapter;

import com.omniagent.modules.social.domain.Channel;

import java.util.List;

public interface SocialPlatformAdapter {

    String getPlatform();

    PublishResult publishPost(Channel channel, String accessToken, PublishPayload payload);

    boolean verifyHealth(String accessToken);

    List<DiscoveredChannel> fetchChannels(String accessToken);

    record PublishPayload(
            String text,
            List<String> mediaUrls,
            String mediaType // TEXT, IMAGE, VIDEO, CAROUSEL
    ) {}

    record PublishResult(
            boolean success,
            String platformPostId,
            String postUrl,
            String rawResponseJson,
            String errorMessage
    ) {}

    record DiscoveredChannel(
            String externalId,
            String title,
            String channelType,
            String metadataJson
    ) {}
}
