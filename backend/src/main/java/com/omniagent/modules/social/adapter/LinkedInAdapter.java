package com.omniagent.modules.social.adapter;

import com.omniagent.modules.social.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class LinkedInAdapter implements SocialPlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(LinkedInAdapter.class);

    @Override
    public String getPlatform() {
        return "LINKEDIN";
    }

    @Override
    public PublishResult publishPost(Channel channel, String accessToken, PublishPayload payload) {
        log.warn("LinkedIn organization post sharing requires official Community Management API app approval.");
        return new PublishResult(
                false,
                null,
                null,
                "{\"status\":\"BLOCKED_BY_EXTERNAL_APPROVAL\"}",
                "LinkedIn Community Management API integration is awaiting enterprise partner approval."
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
