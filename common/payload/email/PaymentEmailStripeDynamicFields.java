package com.skapp.enterprise.common.payload.email;

import com.skapp.community.common.payload.email.CommonEmailDynamicFields;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentEmailStripeDynamicFields extends CommonEmailDynamicFields {

    private String trialEndDate;

    private String billingDate;

    private String retriedDate;

    private String  moveToFreeDate;

    private String endingDate;
}

