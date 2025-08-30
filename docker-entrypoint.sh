EMAIL_FILE="/run/secrets/certbot_email"

if [ -n "$DOMAIN" ] && [ -f "$EMAIL_FILE" ]; then
    EMAIL=$(cat $EMAIL_FILE)
    if [ -n "$EMAIL" ]; then
        if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
            echo "Issuing certificate for $DOMAIN..."
            certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email
        fi
    fi
else
    echo "Email file or DOMAIN not set. Skipping certificate issuance."
fi

crond

nginx -g "daemon off;"
