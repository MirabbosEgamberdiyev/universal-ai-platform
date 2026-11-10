package com.omniagent.modules.social.adapter;

import com.omniagent.modules.social.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class TikTokAdapter implements SocialPlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(TikTokAdapter.class);

    @Override
    public String getPlatform() {
        return "TIKTOK";
    }

    @Override
    public PublishResult publishPost(Channel channel, String accessToken, PublishPayload payload) {
        log.warn("TikTok direct publishing requires production Content Posting API approval. Reporting status.");
        return new PublishResult(
                false,
                null,
                null,
                "{\"status\":\"BLOCKED_BY_EXTERNAL_APPROVAL\"}",
                "TikTok Direct Publishing is awaiting official developer application review and approval by TikTok."
        );
    }

    @Override
    public boolean verifyHealth(String accessToken) {
        return false;
    }

    @Override
    public List<DiscoveredChannel> fetchChannels(String accessToken) {
        return Collections.emptyList();
    }
}
