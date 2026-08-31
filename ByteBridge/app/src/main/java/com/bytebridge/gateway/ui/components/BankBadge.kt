package com.bytebridge.gateway.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bytebridge.gateway.core.model.Bank
import com.bytebridge.gateway.ui.theme.ColorBancamiga
import com.bytebridge.gateway.ui.theme.ColorBancaribe
import com.bytebridge.gateway.ui.theme.ColorBanesco
import com.bytebridge.gateway.ui.theme.ColorBdv
import com.bytebridge.gateway.ui.theme.ColorBnc
import com.bytebridge.gateway.ui.theme.ColorMercantil
import com.bytebridge.gateway.ui.theme.ColorProvincial
import com.bytebridge.gateway.ui.theme.ColorZelle
import com.bytebridge.gateway.ui.theme.ColorZelleBofa
import com.bytebridge.gateway.ui.theme.ColorZelleChase
import com.bytebridge.gateway.ui.theme.ColorZelleCiti
import com.bytebridge.gateway.ui.theme.ColorZelleWf

@Composable
fun BankBadge(bank: Bank, modifier: Modifier = Modifier) {
    val brandColor = when (bank) {
        Bank.BDV -> ColorBdv
        Bank.BANESCO -> ColorBanesco
        Bank.MERCANTIL -> ColorMercantil
        Bank.BANCAMIGA -> ColorBancamiga
        Bank.BBVA_PROVINCIAL -> ColorProvincial
        Bank.BNC -> ColorBnc
        Bank.BANCARIBE -> ColorBancaribe
        Bank.ZELLE_CHASE -> ColorZelleChase
        Bank.ZELLE_BOFA -> ColorZelleBofa
        Bank.ZELLE_WELLS_FARGO -> ColorZelleWf
        Bank.ZELLE_CITI -> ColorZelleCiti
        Bank.ZELLE_GENERIC -> ColorZelle
        Bank.UNKNOWN -> Color(0xFF475569)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(brandColor)
            .padding(horizontal = 7.dp, vertical = 2.5.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = bank.shortName,
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.3.sp
        )
    }
}
